/**
 * Script de carga inicial de datos de COF A Coruña (COFC).
 * Fase 1: Scrape de todos los municipios (HTTP).
 * Fase 2: Escritura bulk a la BD.
 *
 * Uso: jiti scripts/seed-cofc.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import {
  COFC_API_URL,
  COFC_MUNICIPIOS,
  COFC_PROVINCE,
  COFC_PROVINCE_CODE,
  formatDateForCofc,
  parseCofcResponse,
} from '../libs/farmacias/scraper/src/lib/parsers/cofc.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';
import type { ScrapedDutySchedule } from '../libs/farmacias/scraper/src/lib/interfaces/scraper.interfaces';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

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
runSeed('🌿 Seed — COF A Coruña (COFC)', async ({ prisma, log, sleep, cleanup }) => {
  const today = getSpainToday();
  const dateStr = formatDateForCofc(today);
  log(`📅 Fecha: ${dateStr}`);
  log(`📋 Municipios a consultar: ${COFC_MUNICIPIOS.length}`);

  // Obtener token antiforgery
  log('🔑 Obteniendo sesión antiforgery...');
  const session = await fetchSession();
  if (!session) {
    console.error('❌  No se pudo obtener la sesión. Abortando.');
    return;
  }
  log('✅ Sesión obtenida');

  // ── FASE 1: Scrape ──────────────────────────────────────────────────
  const allSchedules: ScrapedDutySchedule[] = [];

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

    if (schedules.length > 0) {
      log(`  📋 ${municipio.nombre.padEnd(35)} ${schedules.length} farmacia(s)`);
      allSchedules.push(...schedules);
    }

    await sleep(300);
  }

  log(`✅ Scraping completado: ${allSchedules.length} farmacias encontradas`);

  if (allSchedules.length === 0) {
    log('⚠️  0 farmacias parseadas. Abortando.');
    return;
  }

  // ── FASE 2: Bulk write (cleanup + insert) ─────────────────────────
  await cleanup();
  const { saved, skipped } = await bulkWriteSchedules(
    prisma,
    { provinceName: COFC_PROVINCE, provinceCode: COFC_PROVINCE_CODE },
    allSchedules,
    log,
  );

  log(`✅ Completado: ${saved} guardadas, ${skipped} errores`);
});
