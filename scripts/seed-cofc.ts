/**
 * Script de carga inicial de datos de COF A Coruña (COFC).
 * Consulta cada municipio de la provincia y guarda las farmacias de guardia en PostgreSQL.
 *
 * Uso: ./node_modules/.bin/jiti scripts/seed-cofc.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../libs/farmacias/data-access/src/generated/prisma';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  COFC_API_URL,
  COFC_MUNICIPIOS,
  COFC_PROVINCE,
  COFC_PROVINCE_CODE,
  formatDateForCofc,
  parseCofcResponse,
} from '../libs/farmacias/scraper/src/lib/parsers/cofc.parser';
import type { ScrapedDutySchedule } from '../libs/farmacias/scraper/src/lib/interfaces/scraper.interfaces';

// ─── BD ───────────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL no está definida. Copia .env.example en .env y rellénalo.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter } as never);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`  ${msg}`);
}
function section(t: string) {
  console.log(`\n${'─'.repeat(55)}\n${t}\n${'─'.repeat(55)}`);
}
function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.cofc.es/farmacia/index',
};

// ─── Session antiforgery ──────────────────────────────────────────────────────
async function fetchSession(): Promise<{ token: string; cookie: string } | null> {
  try {
    const resp = await axios.get<string>(COFC_API_URL, {
      headers: {
        'User-Agent': HEADERS['User-Agent'],
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15_000,
    });
    const $ = cheerio.load(resp.data);
    const token = $('input[name="__RequestVerificationToken"]').first().val() as string;
    if (!token) {
      console.error('❌  No se encontró __RequestVerificationToken en la página de COFC');
      return null;
    }
    const setCookies = (resp.headers['set-cookie'] as string[] | undefined) ?? [];
    const cookie = setCookies.map((c) => c.split(';')[0]).join('; ');
    return { token, cookie };
  } catch (err) {
    console.error(`❌  Error al obtener sesión COFC: ${(err as Error).message}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  section('🌿 Seed — COF A Coruña (COFC)');
  await prisma.$connect();
  log('✅ Conectado a PostgreSQL');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Limpiar turnos anteriores a hoy
  const deleted = await prisma.dutySchedule.deleteMany({ where: { date: { lt: today } } });
  if (deleted.count > 0) log(`🧹 Eliminados ${deleted.count} turnos de guardia anteriores a hoy`);

  const dateStr = formatDateForCofc(today);
  log(`📅 Fecha: ${dateStr}`);
  log(`📋 Municipios a consultar: ${COFC_MUNICIPIOS.length}`);

  // Obtener token antiforgery (requerido por ASP.NET MVC)
  log('🔑 Obteniendo sesión antiforgery...');
  const session = await fetchSession();
  if (!session) {
    console.error('❌  No se pudo obtener la sesión. Abortando.');
    return;
  }
  log('✅ Sesión obtenida');

  // Upsert provincia
  const province = await prisma.province.upsert({
    where: { code: COFC_PROVINCE_CODE },
    update: {},
    create: { name: COFC_PROVINCE, code: COFC_PROVINCE_CODE },
  });

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const municipio of COFC_MUNICIPIOS) {
    let data: unknown;
    const sourceUrl = `${COFC_API_URL}?IdPoblacionFiltro=${municipio.id}&fecha=${dateStr}`;

    try {
      const { data: responseData } = await axios.post<unknown>(
        COFC_API_URL,
        `IdPoblacionFiltro=${municipio.id}&FechaBusqueda=${encodeURIComponent(dateStr)}&LatitudFiltro=0&LongitudFiltro=0&__RequestVerificationToken=${encodeURIComponent(session.token)}`,
        {
          timeout: 15_000,
          headers: {
            ...HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: session.cookie,
          },
        },
      );
      data = responseData;
    } catch {
      log(`  ⚠️  ${municipio.nombre}: sin respuesta`);
      await sleep(300);
      continue;
    }

    const schedules = parseCofcResponse(data, municipio.nombre, today, sourceUrl);

    if (schedules.length === 0) {
      await sleep(300);
      continue;
    }

    log(`  📋 ${municipio.nombre.padEnd(35)} ${schedules.length} farmacia(s)`);

    const { saved, skipped } = await upsertSchedules(schedules, province.id);
    totalSaved += saved;
    totalSkipped += skipped;

    await sleep(300);
  }

  // Resumen
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
  let saved = 0,
    skipped = 0;

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
        update: {
          phone: s.pharmacy.phone ?? undefined,
          ownerName: s.pharmacy.ownerName ?? undefined,
        },
        create: {
          name: s.pharmacy.name,
          ownerName: s.pharmacy.ownerName,
          address: s.pharmacy.address,
          phone: s.pharmacy.phone,
          cityId: city.id,
        },
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
        create: {
          pharmacyId: pharmacy.id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          source: s.sourceUrl,
        },
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
  .catch((err) => {
    console.error('\n❌ Error fatal:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
