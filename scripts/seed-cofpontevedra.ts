/**
 * Script de carga inicial de datos de COF Pontevedra.
 * Fase 1: Scrape de todos los municipios (HTTP).
 * Fase 2: Escritura bulk a la BD.
 *
 * Uso: jiti scripts/seed-cofpontevedra.ts
 */

import axios from 'axios';
import {
  COFPONTEVEDRA_GUARDIA_URL,
  COFPONTEVEDRA_MUNICIPIOS_URL,
  COFPONTEVEDRA_PROVINCE,
  COFPONTEVEDRA_PROVINCE_CODE,
  formatDateForCofpo,
  getSpainToday,
  parseCofpontevedraItems,
  type CofpontevedraMunicipio,
  type ScrapedDutySchedule,
} from '@osplab/farmacias-scraper';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  Accept: '*/*',
  Origin: 'https://cofpo.org',
  Referer: 'https://cofpo.org/',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
runSeed('🌿 Seed — COF Pontevedra', async ({ prisma, log, sleep }) => {
  const today = getSpainToday();
  const dateStr = formatDateForCofpo(today);
  log(`📅 Fecha: ${dateStr}`);

  // ── FASE 1: Scrape ──────────────────────────────────────────────────

  // 1a. Obtener municipios
  log('🌐 Obteniendo lista de municipios...');
  const { data: municipios } = await axios.post<CofpontevedraMunicipio[]>(
    COFPONTEVEDRA_MUNICIPIOS_URL,
    null,
    { timeout: 15_000, headers: HEADERS },
  );
  log(`✅ ${municipios.length} municipios`);

  // 1b. Scraping municipio a municipio
  const allSchedules: ScrapedDutySchedule[] = [];

  for (const municipio of municipios) {
    let items: unknown = [];
    try {
      const { data } = await axios.post(
        `${COFPONTEVEDRA_GUARDIA_URL}?`,
        `search_idmunicipio=${municipio.id}&search_fecha=${dateStr}`,
        {
          timeout: 10_000,
          headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      items = data;
    } catch {
      log(`  ⚠️  ${municipio.nombre}: sin respuesta`);
      await sleep(150);
      continue;
    }

    const sourceUrl = `${COFPONTEVEDRA_GUARDIA_URL}?municipio=${municipio.id}&fecha=${dateStr}`;
    const schedules = parseCofpontevedraItems(items, today, sourceUrl);

    if (schedules.length > 0) {
      log(`  📋 ${municipio.nombre.padEnd(30)} ${schedules.length} farmacia(s)`);
      allSchedules.push(...schedules);
    }

    await sleep(150);
  }

  log(`✅ Scraping completado: ${allSchedules.length} farmacias encontradas`);

  if (allSchedules.length === 0) {
    log('⚠️  0 farmacias parseadas. Abortando.');
    return;
  }

  // ── FASE 2: Bulk write ──────────────────────────────────────────────
  const { saved, skipped } = await bulkWriteSchedules(
    prisma,
    { provinceName: COFPONTEVEDRA_PROVINCE, provinceCode: COFPONTEVEDRA_PROVINCE_CODE },
    allSchedules,
    log,
  );

  log(`✅ Completado: ${saved} guardadas, ${skipped} errores`);
});
