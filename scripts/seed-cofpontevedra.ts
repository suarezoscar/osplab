/**
 * Script de carga inicial de datos de COF Pontevedra.
 * Consulta cada municipio de Pontevedra y guarda las farmacias de guardia en PostgreSQL.
 *
 * Uso: ./node_modules/.bin/jiti scripts/seed-cofpontevedra.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../libs/api/data-access/src/generated/prisma';
import axios from 'axios';
import {
  COFPONTEVEDRA_GUARDIA_URL,
  COFPONTEVEDRA_MUNICIPIOS_URL,
  COFPONTEVEDRA_PROVINCE,
  COFPONTEVEDRA_PROVINCE_CODE,
  formatDateForCofpo,
  parseCofpontevedraItems,
  type CofpontevedraMunicipio,
} from '../libs/api/scraper/src/lib/parsers/cofpontevedra.parser';
import type { ScrapedDutySchedule } from '../libs/api/scraper/src/lib/interfaces/scraper.interfaces';

// ─── BD ───────────────────────────────────────────────────────────────────────
const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:REDACTED@localhost:5432/farmacias_guardia?schema=public';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter } as never);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(msg: string)     { console.log(`  ${msg}`); }
function section(t: string)   { console.log(`\n${'─'.repeat(55)}\n${t}\n${'─'.repeat(55)}`); }
function sleep(ms: number)    { return new Promise<void>((r) => setTimeout(r, ms)); }

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  Accept: '*/*',
  Origin: 'https://cofpo.org',
  Referer: 'https://cofpo.org/',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  section('🌿 Seed — COF Pontevedra');
  await prisma.$connect();
  log('✅ Conectado a PostgreSQL');

  const now   = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Limpiar turnos anteriores a hoy
  const deleted = await prisma.dutySchedule.deleteMany({ where: { date: { lt: today } } });
  if (deleted.count > 0) log(`🧹 Eliminados ${deleted.count} turnos de guardia anteriores a hoy`);

  const dateStr = formatDateForCofpo(today);
  log(`📅 Fecha: ${dateStr}`);

  // 1. Obtener municipios
  log('🌐 Obteniendo lista de municipios...');
  const { data: municipios } = await axios.post<CofpontevedraMunicipio[]>(
    COFPONTEVEDRA_MUNICIPIOS_URL,
    null,
    { timeout: 15_000, headers: HEADERS },
  );
  log(`✅ ${municipios.length} municipios`);

  // 2. Upsert provincia
  const province = await prisma.province.upsert({
    where: { code: COFPONTEVEDRA_PROVINCE_CODE },
    update: {},
    create: { name: COFPONTEVEDRA_PROVINCE, code: COFPONTEVEDRA_PROVINCE_CODE },
  });

  // 3. Scraping municipio a municipio
  let totalSaved = 0;
  let totalSkipped = 0;

  for (const municipio of municipios) {
    let items: unknown = [];
    try {
      const { data } = await axios.post(
        `${COFPONTEVEDRA_GUARDIA_URL}?`,
        `search_idmunicipio=${municipio.id}&search_fecha=${dateStr}`,
        { timeout: 10_000, headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      items = data;
    } catch {
      log(`  ⚠️  ${municipio.nombre}: sin respuesta`);
      await sleep(150);
      continue;
    }

    const sourceUrl = `${COFPONTEVEDRA_GUARDIA_URL}?municipio=${municipio.id}&fecha=${dateStr}`;
    const schedules = parseCofpontevedraItems(items, today, sourceUrl);

    if (schedules.length === 0) {
      await sleep(150);
      continue;
    }

    log(`  📋 ${municipio.nombre.padEnd(30)} ${schedules.length} farmacia(s)`);

    const { saved, skipped } = await upsertSchedules(schedules, province.id);
    totalSaved   += saved;
    totalSkipped += skipped;

    await sleep(150);
  }

  // 4. Resumen
  section(`✅ Completado: ${totalSaved} guardadas, ${totalSkipped} errores`);

  const withLocation = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) FROM "Pharmacy" WHERE location IS NOT NULL
  `;
  const total = await prisma.pharmacy.count();
  const scheduleCount = await prisma.dutySchedule.count();

  log(`📊 BD ahora tiene:`);
  log(`   - ${total} farmacia(s) en total`);
  log(`   - ${Number(withLocation[0].count)} con coordenadas PostGIS`);
  log(`   - ${scheduleCount} turno(s) de guardia`);
}

async function upsertSchedules(
  schedules: ScrapedDutySchedule[],
  provinceId: string,
): Promise<{ saved: number; skipped: number }> {
  let saved = 0, skipped = 0;

  for (const s of schedules) {
    try {
      const city = await prisma.city.upsert({
        where: { name_provinceId: { name: s.pharmacy.cityName, provinceId } },
        update: {},
        create: { name: s.pharmacy.cityName, provinceId },
      });

      const existing = await prisma.pharmacy.findFirst({
        where: { name: s.pharmacy.name, address: s.pharmacy.address, cityId: city.id },
        select: { id: true },
      });

      const pharmacy = await prisma.pharmacy.upsert({
        where: { id: existing?.id ?? 'new' },
        update: { phone: s.pharmacy.phone ?? undefined },
        create: { name: s.pharmacy.name, address: s.pharmacy.address, phone: s.pharmacy.phone, cityId: city.id },
      });

      if (s.pharmacy.lat != null && s.pharmacy.lng != null) {
        await prisma.$executeRaw`
          UPDATE "Pharmacy"
          SET location = ST_SetSRID(ST_MakePoint(${s.pharmacy.lng}, ${s.pharmacy.lat}), 4326)::geography
          WHERE id = ${pharmacy.id}
        `;
      }

      await prisma.dutySchedule.upsert({
        where: { pharmacyId_date: { pharmacyId: pharmacy.id, date: s.date } },
        update: { startTime: s.startTime, endTime: s.endTime, source: s.sourceUrl },
        create: { pharmacyId: pharmacy.id, date: s.date, startTime: s.startTime, endTime: s.endTime, source: s.sourceUrl },
      });

      saved++;
    } catch (err) {
      skipped++;
      log(`    ❌ ${s.pharmacy.name}: ${(err as Error).message}`);
    }
  }

  return { saved, skipped };
}

main()
  .catch((err) => { console.error('\n❌ Error fatal:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

