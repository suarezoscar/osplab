/**
 * Script de carga inicial de datos de COF Lugo.
 * Consulta la web de guardia municipio por municipio, parsea el HTML y guarda en PostgreSQL.
 *
 * Uso: pnpm seed:coflugo
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../libs/api/data-access/src/generated/prisma';
import axios from 'axios';
import {
  buildCoflugoUrl,
  parseCoflugoHtml,
  COFLUGO_MUNICIPIOS,
  COFLUGO_PROVINCE,
  COFLUGO_PROVINCE_CODE,
} from '../libs/api/scraper/src/lib/parsers/coflugo.parser';

// ─── Conexión a BD ───────────────────────────────────────────────────────────
const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL no está definida. Copia .env.example en .env y rellénalo.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter } as never);

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: 'https://www.coflugo.org/farmacia-guardia',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`  ${msg}`);
}
function section(title: string) {
  console.log(`\n${'─'.repeat(55)}\n${title}\n${'─'.repeat(55)}`);
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  section('🌿 Seed — COF Lugo');

  await prisma.$connect();
  log('✅ Conectado a PostgreSQL');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Limpiar turnos anteriores a hoy
  const deleted = await prisma.dutySchedule.deleteMany({ where: { date: { lt: today } } });
  if (deleted.count > 0) log(`🧹 Eliminados ${deleted.count} turnos de guardia anteriores a hoy`);

  // Upsert provincia
  const province = await prisma.province.upsert({
    where: { code: COFLUGO_PROVINCE_CODE },
    update: {},
    create: { name: COFLUGO_PROVINCE, code: COFLUGO_PROVINCE_CODE },
  });
  log(`🗺️  Provincia: ${province.name} (${province.code})`);

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const municipio of COFLUGO_MUNICIPIOS) {
    const url = buildCoflugoUrl(municipio.id, today);

    let html: string;
    try {
      const response = await axios.get<string>(url, {
        timeout: 10_000,
        headers: COMMON_HEADERS,
        responseType: 'text',
      });
      html = response.data;
    } catch (err) {
      log(`⚠️  ${municipio.nombre}: error HTTP — ${(err as Error).message}`);
      continue;
    }

    const schedules = parseCoflugoHtml(html, municipio.nombre, today, url);
    if (schedules.length === 0) {
      await sleep(150);
      continue;
    }

    log(`📋 ${municipio.nombre}: ${schedules.length} farmacia(s) de guardia`);

    for (const schedule of schedules) {
      try {
        const city = await prisma.city.upsert({
          where: { name_provinceId: { name: schedule.pharmacy.cityName, provinceId: province.id } },
          update: {},
          create: { name: schedule.pharmacy.cityName, provinceId: province.id },
        });

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
        totalSaved++;
      } catch (err) {
        totalSkipped++;
        log(`  ❌ ${schedule.pharmacy.name}: ${(err as Error).message}`);
      }
    }

    await sleep(200);
  }

  // Resumen final
  section(`✅ Completado: ${totalSaved} guardadas, ${totalSkipped} errores`);

  const withLocation = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) FROM "Pharmacy" WHERE location IS NOT NULL
  `;
  const total = await prisma.pharmacy.count();
  const scheduleCount = await prisma.dutySchedule.count();

  log('📊 BD ahora tiene:');
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
