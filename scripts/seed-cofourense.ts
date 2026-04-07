/**
 * Script de carga inicial de datos de COF Ourense.
 * Llama a la API, parsea la respuesta y guarda en PostgreSQL directamente.
 *
 * Uso: node --require @swc-node/register scripts/seed-cofourense.ts
 *      o: ./node_modules/.bin/jiti scripts/seed-cofourense.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../libs/farmacias/data-access/src/generated/prisma';
import axios from 'axios';
import {
  buildCofourenseUrl,
  parseCofourenseResponse,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
} from '../libs/farmacias/scraper/src/lib/parsers/cofourense.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';

// ─── Conexión a BD ───────────────────────────────────────────────────────────
const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL no está definida. Copia .env.example en .env y rellénalo.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter } as never);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`  ${msg}`);
}
function section(title: string) {
  console.log(`\n${'─'.repeat(55)}\n${title}\n${'─'.repeat(55)}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  section('🌿 Seed — COF Ourense');

  await prisma.$connect();
  log('✅ Conectado a PostgreSQL');

  // 0. Limpiar turnos de guardia de días anteriores
  const now = new Date();
  const today = getSpainToday();
  const deleted = await prisma.dutySchedule.deleteMany({ where: { date: { lt: today } } });
  if (deleted.count > 0) log(`🧹 Eliminados ${deleted.count} turnos de guardia anteriores a hoy`);

  // 1. Llamar a la API

  const url = buildCofourenseUrl(now);
  log(`🌐 Consultando: ${url}`);

  const response = await axios.get<unknown>(url, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      Accept: 'application/json, text/plain, */*',
      Referer: 'https://www.cofourense.es/buscador-de-farmacias-de-guardia/',
    },
  });

  log(`✅ HTTP ${response.status} — parseando respuesta...`);

  const schedules = parseCofourenseResponse(response.data, today, url);
  if (schedules.length === 0) {
    log('⚠️  0 farmacias parseadas. Abortando.');
    return;
  }
  log(`📋 ${schedules.length} farmacias de guardia encontradas para hoy`);

  // 2. Upsert provincia
  const province = await prisma.province.upsert({
    where: { code: COFOURENSE_PROVINCE_CODE },
    update: {},
    create: { name: COFOURENSE_PROVINCE, code: COFOURENSE_PROVINCE_CODE },
  });
  log(`🗺️  Provincia: ${province.name} (${province.code})`);

  // 3. Guardar cada farmacia + turno
  let saved = 0;
  let skipped = 0;

  for (const schedule of schedules) {
    try {
      // Ciudad
      const city = await prisma.city.upsert({
        where: { name_provinceId: { name: schedule.pharmacy.cityName, provinceId: province.id } },
        update: {},
        create: { name: schedule.pharmacy.cityName, provinceId: province.id },
      });

      // Farmacia
      const existing = await prisma.pharmacy.findFirst({
        where: {
          name: schedule.pharmacy.name,
          address: schedule.pharmacy.address,
          cityId: city.id,
        },
        select: { id: true },
      });

      const pharmacy = await prisma.pharmacy.upsert({
        where: { id: existing?.id ?? 'new' },
        update: {
          phone: schedule.pharmacy.phone ?? undefined,
          ownerName: schedule.pharmacy.ownerName ?? undefined,
        },
        create: {
          name: schedule.pharmacy.name,
          ownerName: schedule.pharmacy.ownerName,
          address: schedule.pharmacy.address,
          phone: schedule.pharmacy.phone,
          cityId: city.id,
        },
      });

      // PostGIS location
      if (schedule.pharmacy.lat != null && schedule.pharmacy.lng != null) {
        await prisma.$executeRaw`
          UPDATE "Pharmacy"
          SET location = ST_SetSRID(
            ST_MakePoint(${schedule.pharmacy.lng}, ${schedule.pharmacy.lat}),
            4326
          )::geography
          WHERE id = ${pharmacy.id}
        `;
      }

      // Turno de guardia
      await prisma.dutySchedule.upsert({
        where: { pharmacyId_date: { pharmacyId: pharmacy.id, date: schedule.date } },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          source: schedule.sourceUrl,
        },
        create: {
          pharmacyId: pharmacy.id,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          source: schedule.sourceUrl,
        },
      });

      const coords =
        schedule.pharmacy.lat != null
          ? `📍 ${schedule.pharmacy.lat},${schedule.pharmacy.lng}`
          : '⚠️  sin coords';
      log(
        `  💾 ${schedule.pharmacy.name.padEnd(35)} ${schedule.pharmacy.cityName.padEnd(25)} ${coords}`,
      );
      saved++;
    } catch (err) {
      skipped++;
      log(`  ❌ ${schedule.pharmacy.name}: ${(err as Error).message}`);
    }
  }

  // 4. Resumen final
  section(`✅ Completado: ${saved} guardadas, ${skipped} errores`);

  // 5. Verificar en BD
  const withLocation = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) FROM "Pharmacy" WHERE location IS NOT NULL
  `;
  const total = await prisma.pharmacy.count();
  const scheduleCount = await prisma.dutySchedule.count();

  log(`📊 BD ahora tiene:`);
  log(`   - ${total} farmacia(s) en total`);
  log(`   - ${Number(withLocation[0].count)} farmacia(s) con coordenadas PostGIS`);
  log(`   - ${scheduleCount} turno(s) de guardia`);
}

main()
  .catch((err) => {
    console.error('\n❌ Error fatal:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
