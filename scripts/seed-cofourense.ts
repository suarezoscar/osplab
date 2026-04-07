/**
 * Script de carga inicial de datos de COF Ourense.
 * Fase 1: Llama a la API y parsea toda la respuesta.
 * Fase 2: Escribe todo de golpe en la BD con bulk SQL.
 *
 * Uso: jiti scripts/seed-cofourense.ts
 */

import axios from 'axios';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import {
  buildCofourenseUrl,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
  parseCofourenseResponse,
} from '../libs/farmacias/scraper/src/lib/parsers/cofourense.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

// ─── Main ────────────────────────────────────────────────────────────────────
runSeed('🌿 Seed — COF Ourense', async ({ prisma, log }) => {
  const now = new Date();
  const today = getSpainToday();

  // ── FASE 1: Scrape ──────────────────────────────────────────────────
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

  // ── FASE 2: Bulk write ──────────────────────────────────────────────
  const { saved, skipped } = await bulkWriteSchedules(
    prisma,
    { provinceName: COFOURENSE_PROVINCE, provinceCode: COFOURENSE_PROVINCE_CODE },
    schedules,
    log,
  );

  log(`✅ Completado: ${saved} guardadas, ${skipped} errores`);
});
