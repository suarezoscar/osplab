import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import {
  buildCoflugoUrl,
  COFLUGO_MUNICIPIOS,
  COFLUGO_PROVINCE,
  COFLUGO_PROVINCE_CODE,
  parseCoflugoHtml,
} from '../parsers/coflugo.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';
import { getSpainToday } from '../utils/spain-date.util';
import { isHardConnectionError } from '../utils/http-errors.util';
import type { ScrapeResult } from '../interfaces/scraper.interfaces';

/** Pausa entre peticiones (ms) — respetar el rate limit del servidor */
const REQUEST_DELAY_MS = 300;

/** Timeout HTTP (ms) — coflugo.org puede ser lento desde fuera de España */
const HTTP_TIMEOUT_MS = 30_000;

/** Número máximo de reintentos por municipio (solo para errores transitorios) */
const MAX_RETRIES = 2;

/**
 * Circuit breaker: si N municipios consecutivos fallan por error de conexión
 * duro (ECONNREFUSED, ENOTFOUND…), abortamos el scrape completo.
 */
const CIRCUIT_BREAKER_THRESHOLD = 3;

/** Resultado especial de scrapeMunicipio: error HTTP transitorio */
const ERR_SOFT = -1;
/** Resultado especial de scrapeMunicipio: error de conexión duro (circuit breaker) */
const ERR_HARD = -2;

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: 'https://www.coflugo.org/farmacia-guardia',
};

@Injectable()
export class CoflugoScraperService {
  private readonly logger = new Logger(CoflugoScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleWriter: ScheduleWriterService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF Lugo...');
    await this.scrapeToday();
  }

  async scrapeToday(): Promise<ScrapeResult> {
    const today = getSpainToday();
    await cleanOldSchedules(this.prisma, this.logger, 'COF Lugo');
    return this.scrapeForDate(today);
  }

  async scrapeForDate(targetDate: Date): Promise<ScrapeResult> {
    this.logger.debug(
      `🔍 COF Lugo: consultando ${COFLUGO_MUNICIPIOS.length} municipios para ${targetDate.toISOString().slice(0, 10)}`,
    );

    let totalSaved = 0;
    let totalErrors = 0;
    let consecutiveHardFails = 0;

    for (const municipio of COFLUGO_MUNICIPIOS) {
      const saved = await this.scrapeMunicipio(municipio, targetDate);

      if (saved === ERR_HARD) {
        totalErrors++;
        consecutiveHardFails++;

        if (consecutiveHardFails >= CIRCUIT_BREAKER_THRESHOLD) {
          this.logger.warn(
            `🔌 COF Lugo: circuit breaker activado tras ${consecutiveHardFails} fallos consecutivos de conexión. ` +
              `Servidor probablemente caído o bloqueando la IP. Abortando scrape.`,
          );
          return {
            saved: totalSaved,
            errors: COFLUGO_MUNICIPIOS.length - totalSaved,
            municipalities: COFLUGO_MUNICIPIOS.length,
          };
        }
      } else if (saved === ERR_SOFT) {
        totalErrors++;
        consecutiveHardFails = 0; // Reset: el error no es de conexión
      } else {
        totalSaved += saved;
        consecutiveHardFails = 0; // Reset: municipio OK
      }

      await sleep(REQUEST_DELAY_MS);
    }

    this.logger.log(`✅ COF Lugo: ${totalSaved} turnos guardados, ${totalErrors} errores`);
    return { saved: totalSaved, errors: totalErrors, municipalities: COFLUGO_MUNICIPIOS.length };
  }

  // ── Métodos privados ──────────────────────────────────────────────────────

  private async scrapeMunicipio(
    municipio: { id: number; nombre: string },
    targetDate: Date,
  ): Promise<number> {
    const url = buildCoflugoUrl(municipio.id, targetDate);

    let html: string | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get<string>(url, {
          timeout: HTTP_TIMEOUT_MS,
          headers: COMMON_HEADERS,
          responseType: 'text',
        });
        html = response.data;
        break;
      } catch (err) {
        // Error de conexión duro → no reintentar, activar circuit breaker
        if (isHardConnectionError(err)) {
          this.logger.warn(
            `⚠️  ${municipio.nombre}: conexión rechazada (${(err as NodeJS.ErrnoException).code ?? (err as Error).message})`,
          );
          return ERR_HARD;
        }

        if (attempt < MAX_RETRIES) {
          const backoff = (attempt + 1) * 1_000;
          this.logger.debug(
            `⏳ ${municipio.nombre}: reintento ${attempt + 1}/${MAX_RETRIES} en ${backoff}ms`,
          );
          await sleep(backoff);
        } else {
          this.logger.warn(
            `⚠️  ${municipio.nombre}: error al consultar COFLugo tras ${MAX_RETRIES + 1} intentos — ${(err as Error).message}`,
          );
          return ERR_SOFT;
        }
      }
    }

    if (!html) return 0;

    const schedules = parseCoflugoHtml(html, municipio.nombre, targetDate, url);
    if (schedules.length === 0) return 0;

    this.logger.debug(`  📋 ${municipio.nombre}: ${schedules.length} farmacia(s) de guardia`);

    const { saved } = await this.scheduleWriter.upsertSchedules(
      { name: COFLUGO_PROVINCE, code: COFLUGO_PROVINCE_CODE },
      schedules,
    );
    return saved;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
