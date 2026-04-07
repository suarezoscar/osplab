/**
 * Script de carga inicial de datos de COF Lugo.
 * Fase 1: Scrape de todos los municipios (HTTP).
 * Fase 2: Escritura bulk a la BD.
 *
 * Uso: pnpm seed:coflugo
 */

import axios from 'axios';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import {
  buildCoflugoUrl,
  COFLUGO_MUNICIPIOS,
  COFLUGO_PROVINCE,
  COFLUGO_PROVINCE_CODE,
  parseCoflugoHtml,
} from '../libs/farmacias/scraper/src/lib/parsers/coflugo.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';
import type { ScrapedDutySchedule } from '../libs/farmacias/scraper/src/lib/interfaces/scraper.interfaces';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: 'https://www.coflugo.org/farmacia-guardia',
};

// ─── Main ────────────────────────────────────────────────────────────────────
runSeed('🌿 Seed — COF Lugo', async ({ prisma, log, sleep }) => {
  const today = getSpainToday();

  // ── FASE 1: Scrape todos los municipios ─────────────────────────────
  log(`🌐 Consultando ${COFLUGO_MUNICIPIOS.length} municipios...`);

  const allSchedules: ScrapedDutySchedule[] = [];
  let httpErrors = 0;

  for (const municipio of COFLUGO_MUNICIPIOS) {
    const url = buildCoflugoUrl(municipio.id, today);

    let html: string | undefined;
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await axios.get<string>(url, {
          timeout: 30_000,
          headers: COMMON_HEADERS,
          responseType: 'text',
        });
        html = response.data;
        break;
      } catch (err) {
        if (attempt < 2) {
          const backoff = (attempt + 1) * 1_000;
          log(`⏳ ${municipio.nombre}: reintento ${attempt + 1}/2 en ${backoff}ms...`);
          await sleep(backoff);
        } else {
          log(`⚠️  ${municipio.nombre}: error HTTP tras 3 intentos — ${(err as Error).message}`);
          httpErrors++;
        }
      }
    }

    if (!html) continue;

    const schedules = parseCoflugoHtml(html, municipio.nombre, today, url);
    if (schedules.length > 0) {
      log(`  📋 ${municipio.nombre}: ${schedules.length} farmacia(s)`);
      allSchedules.push(...schedules);
    }

    await sleep(300);
  }

  log(
    `✅ Scraping completado: ${allSchedules.length} farmacias encontradas (${httpErrors} errores HTTP)`,
  );

  if (allSchedules.length === 0) {
    log('⚠️  0 farmacias parseadas. Abortando.');
    return;
  }

  // ── FASE 2: Bulk write ──────────────────────────────────────────────
  const { saved, skipped } = await bulkWriteSchedules(
    prisma,
    { provinceName: COFLUGO_PROVINCE, provinceCode: COFLUGO_PROVINCE_CODE },
    allSchedules,
    log,
  );

  log(`✅ Completado: ${saved} guardadas, ${skipped} errores`);
});
