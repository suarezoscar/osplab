/**
 * Script de carga inicial de datos de COFM Madrid.
 * Fase 1: Llama a la API REST y parsea las farmacias de guardia.
 * Fase 2: Escribe todo de golpe en la BD con bulk SQL.
 *
 * Uso: jiti scripts/seed-cofm.ts
 */

import axios from 'axios';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import {
  COFM_API_URL,
  COFM_PROVINCE,
  COFM_PROVINCE_CODE,
  parseCofmResponse,
} from '../libs/farmacias/scraper/src/lib/parsers/cofm.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

// ─── Main ────────────────────────────────────────────────────────────────────
runSeed('🌿 Seed — COFM Madrid', async ({ prisma, log, cleanup }) => {
  const today = getSpainToday();

  // ── FASE 1: Scrape ──────────────────────────────────────────────────
  log(`🌐 Consultando: ${COFM_API_URL}`);

  const response = await axios.get<unknown>(COFM_API_URL, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      Accept: 'application/json, text/plain, */*',
      Referer: 'https://www.cofm.es/',
    },
  });

  log(`✅ HTTP ${response.status} — parseando respuesta...`);

  const schedules = parseCofmResponse(response.data, today, COFM_API_URL);
  if (schedules.length === 0) {
    log('⚠️  0 farmacias de guardia parseadas. Abortando.');
    return;
  }
  log(`📋 ${schedules.length} turnos de guardia encontrados para hoy`);

  // ── FASE 2: Bulk write (cleanup + insert) ─────────────────────────
  await cleanup();
  const { saved, skipped } = await bulkWriteSchedules(
    prisma,
    { provinceName: COFM_PROVINCE, provinceCode: COFM_PROVINCE_CODE },
    schedules,
    log,
  );

  log(`✅ Completado: ${saved} guardados, ${skipped} errores`);
});
