import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import {
  FARMAGUIA_INDEX_URL,
  FARMAGUIA_LANG_URL,
  FARMAGUIA_PROVINCES,
  FARMAGUIA_DEFAULT_PROVINCE,
  buildFarmaguiaUrl,
  extractMagicKey,
  parseFarmaguiaResponse,
} from '../parsers/farmaguia.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';
import { getSpainToday } from '../utils/spain-date.util';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'ca,es;q=0.9',
  Referer: 'https://www.farmaguia.net/desktop/index.html',
  'X-Requested-With': 'XMLHttpRequest',
};

/** Extrae cookies Set-Cookie y las fusiona con las existentes. */
function mergeCookies(resp: { headers: Record<string, unknown> }, existing: string): string {
  const sc = (resp.headers['set-cookie'] as string[] | undefined) ?? [];
  const newParts = sc.map((c) => c.split(';')[0]);
  return existing ? [existing, ...newParts].join('; ') : newParts.join('; ');
}

@Injectable()
export class FarmaguiaScraperService {
  private readonly logger = new Logger(FarmaguiaScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleWriter: ScheduleWriterService,
  ) {}

  /**
   * Ejecuta el scraping automáticamente cada día a las 06:10.
   * También puede invocarse manualmente con scrapeToday().
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de Farmaguia Barcelona...');
    await this.scrapeToday();
  }

  /**
   * Scraping de las farmacias de guardia de Barcelona para hoy.
   */
  async scrapeToday(): Promise<void> {
    const today = getSpainToday();

    await cleanOldSchedules(this.prisma, this.logger, 'Farmaguia Barcelona');
    await this.scrapeForDate(today);
  }

  /**
   * Scraping de las farmacias de guardia de Barcelona para una fecha concreta.
   *
   * Flujo (3 pasos):
   *   1. Visitar index.html para inicializar la sesión PHP (PHPSESSID)
   *   2. Obtener MagicKey del lang.js (reutilizando la misma cookie de sesión)
   *   3. Consultar la API de datos con el MagicKey y la cookie
   *
   * Sin el paso 1, la API devuelve un array vacío.
   *
   * @param targetDate - Fecha de guardia a almacenar (sin hora)
   */
  async scrapeForDate(targetDate: Date): Promise<void> {
    let cookies = '';

    // ── Paso 1: Inicializar sesión ───────────────────────────────────
    this.logger.debug(`🌐 Inicializando sesión en Farmaguia (${FARMAGUIA_INDEX_URL})...`);

    try {
      const indexResp = await axios.get(FARMAGUIA_INDEX_URL, {
        timeout: 15_000,
        headers: { ...HEADERS, Accept: 'text/html' },
      });
      cookies = mergeCookies(indexResp, cookies);
    } catch (err) {
      this.logger.warn(`⚠️  No se pudo inicializar sesión en Farmaguia: ${(err as Error).message}`);
      return;
    }

    // ── Paso 2: Obtener MagicKey ─────────────────────────────────────
    this.logger.debug(`🔑 Obteniendo MagicKey de Farmaguia...`);

    let magicKey: string | null = null;

    try {
      const langResp = await axios.get<string>(FARMAGUIA_LANG_URL, {
        timeout: 15_000,
        headers: { ...HEADERS, Accept: 'text/javascript, */*', Cookie: cookies },
      });

      magicKey = extractMagicKey(langResp.data);
      cookies = mergeCookies(langResp, cookies);
    } catch (err) {
      this.logger.warn(`⚠️  No se pudo obtener MagicKey de Farmaguia: ${(err as Error).message}`);
      return;
    }

    if (!magicKey) {
      this.logger.warn(
        `⚠️  Farmaguia: MagicKey no encontrada en lang.js. La estructura puede haber cambiado.`,
      );
      return;
    }

    this.logger.debug(`✅ MagicKey obtenida, sesión inicializada`);

    // ── Paso 3: Consultar API de datos ───────────────────────────────
    // No pasamos fecha (h): usamos el estado en tiempo real de la API.
    const url = buildFarmaguiaUrl(magicKey);
    this.logger.debug(`🔍 Consultando API Farmaguia: ${url.slice(0, 80)}...`);

    let data: unknown;
    try {
      const response = await axios.get<unknown>(url, {
        timeout: 30_000,
        headers: { ...HEADERS, Cookie: cookies },
        maxRedirects: 5,
      });
      data = response.data;
    } catch (err) {
      this.logger.warn(`⚠️  No se pudo consultar la API de Farmaguia: ${(err as Error).message}`);
      return;
    }

    const schedules = parseFarmaguiaResponse(data, targetDate, url);

    if (schedules.length === 0) {
      this.logger.warn(
        `⚠️  Farmaguia Barcelona: respuesta recibida pero 0 farmacias de guardia parseadas. ` +
          `La estructura de la API puede haber cambiado.`,
      );
      return;
    }

    this.logger.debug(`📋 Farmaguia Barcelona: ${schedules.length} turnos de guardia encontrados`);

    // Agrupar por provincia (cada farmacia tiene su provinceName por código postal)
    const byProvince = new Map<string, typeof schedules>();
    for (const s of schedules) {
      const prov = s.pharmacy.provinceName;
      const list = byProvince.get(prov) ?? [];
      list.push(s);
      byProvince.set(prov, list);
    }

    // Construir lookup inverso: provinceName → { name, code }
    const provinceCodeMap = new Map<string, { name: string; code: string }>();
    for (const info of FARMAGUIA_PROVINCES.values()) {
      provinceCodeMap.set(info.name, info);
    }
    provinceCodeMap.set(FARMAGUIA_DEFAULT_PROVINCE.name, FARMAGUIA_DEFAULT_PROVINCE);

    let totalSaved = 0;
    let totalSkipped = 0;

    for (const [provinceName, provinceSchedules] of byProvince) {
      const info = provinceCodeMap.get(provinceName) ?? FARMAGUIA_DEFAULT_PROVINCE;

      const { saved, skipped } = await this.scheduleWriter.upsertSchedules(
        { name: info.name, code: info.code },
        provinceSchedules,
      );

      this.logger.debug(`💾 ${provinceName}: ${saved} guardados, ${skipped} omitidos`);
      totalSaved += saved;
      totalSkipped += skipped;
    }

    this.logger.log(
      `💾 Farmaguia Barcelona: ${totalSaved} turnos guardados, ${totalSkipped} omitidos (${byProvince.size} provincias)`,
    );
  }
}
