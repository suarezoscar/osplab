/**
 * Script de carga inicial de datos de Farmaguia (Barcelona).
 *
 * Flujo (3 fases):
 *   1. Visitar index.html para inicializar la sesión PHP (PHPSESSID).
 *      Sin este paso, la API devuelve un array vacío.
 *   2. Obtener MagicKey del lang.js y consultar la API de datos.
 *   3. Parsear y escribir en BD.
 *
 * Uso: pnpm jiti scripts/seed-farmaguia.ts
 */

import axios from 'axios';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import {
  FARMAGUIA_INDEX_URL,
  FARMAGUIA_LANG_URL,
  FARMAGUIA_PROVINCES,
  FARMAGUIA_DEFAULT_PROVINCE,
  buildFarmaguiaUrl,
  extractMagicKey,
  parseFarmaguiaResponse,
} from '../libs/farmacias/scraper/src/lib/parsers/farmaguia.parser';
import { getSpainToday } from '../libs/farmacias/scraper/src/lib/utils/spain-date.util';
import { bulkWriteSchedules, runSeed } from './lib/seed-helpers';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'ca,es;q=0.9',
  Referer: 'https://www.farmaguia.net/desktop/index.html',
  'X-Requested-With': 'XMLHttpRequest',
};

function extractCookies(resp: { headers: Record<string, unknown> }, existing: string): string {
  const sc = (resp.headers['set-cookie'] as string[] | undefined) ?? [];
  const parts = sc.map((c: string) => c.split(';')[0]);
  return existing ? [existing, ...parts].join('; ') : parts.join('; ');
}

// ─── Main ────────────────────────────────────────────────────────────────────
runSeed('🌿 Seed — Farmaguia Barcelona', async ({ prisma, log, cleanup }) => {
  const today = getSpainToday();
  let cookies = '';

  // ── FASE 1: Inicializar sesión ──────────────────────────────────────
  log(`🌐 Inicializando sesión en ${FARMAGUIA_INDEX_URL}...`);
  const indexResp = await axios.get(FARMAGUIA_INDEX_URL, {
    timeout: 15_000,
    headers: { ...HEADERS, Accept: 'text/html' },
  });
  cookies = extractCookies(indexResp, cookies);
  log('✅ Sesión inicializada');

  // ── FASE 2: Obtener MagicKey ────────────────────────────────────────
  log(`🔑 Obteniendo MagicKey de ${FARMAGUIA_LANG_URL}...`);
  const langResp = await axios.get<string>(FARMAGUIA_LANG_URL, {
    timeout: 15_000,
    headers: { ...HEADERS, Accept: 'text/javascript, */*', Cookie: cookies },
  });
  cookies = extractCookies(langResp, cookies);

  const magicKey = extractMagicKey(langResp.data);
  if (!magicKey) {
    log('❌ No se pudo extraer MagicKey del lang.js. Abortando.');
    return;
  }
  log('✅ MagicKey obtenida');

  // ── FASE 3: Consultar API de datos ──────────────────────────────────
  // No pasamos fecha (h): usamos el estado en tiempo real de la API.
  const url = buildFarmaguiaUrl(magicKey);
  log(`🌐 Consultando: ${url.slice(0, 100)}...`);

  const response = await axios.get<unknown>(url, {
    timeout: 30_000,
    headers: { ...HEADERS, Cookie: cookies },
  });

  log(`✅ HTTP ${response.status} — parseando respuesta...`);

  const schedules = parseFarmaguiaResponse(response.data, today, url);
  if (schedules.length === 0) {
    log('⚠️  0 farmacias de guardia parseadas. Abortando.');
    return;
  }
  log(`📋 ${schedules.length} turnos de guardia encontrados para hoy`);

  // ── FASE 4: Agrupar por provincia y bulk write ─────────────────────
  // Cada farmacia ya tiene su provinceName asignado por código postal.
  // Cleanup solo si hay datos nuevos — no borramos sin reemplazo.
  await cleanup();
  const byProvince = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const prov = s.pharmacy.provinceName;
    const list = byProvince.get(prov) ?? [];
    list.push(s);
    byProvince.set(prov, list);
  }

  // Construir lookup inverso: provinceName → { name, code }
  const provinceCodeMap = new Map<string, { name: string; code: string }>();
  for (const info of Array.from(FARMAGUIA_PROVINCES.values())) {
    provinceCodeMap.set(info.name, info);
  }
  provinceCodeMap.set(FARMAGUIA_DEFAULT_PROVINCE.name, FARMAGUIA_DEFAULT_PROVINCE);

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const [provinceName, provinceSchedules] of Array.from(byProvince)) {
    const info = provinceCodeMap.get(provinceName) ?? FARMAGUIA_DEFAULT_PROVINCE;
    log(`\n🗺️  Escribiendo ${provinceSchedules.length} turnos de ${provinceName}...`);

    const { saved, skipped } = await bulkWriteSchedules(
      prisma,
      { provinceName: info.name, provinceCode: info.code },
      provinceSchedules,
      log,
    );

    totalSaved += saved;
    totalSkipped += skipped;
  }

  log(
    `\n✅ Completado: ${totalSaved} guardados, ${totalSkipped} errores (${byProvince.size} provincias)`,
  );
});
