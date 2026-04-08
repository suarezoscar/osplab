import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import {
  COFPONTEVEDRA_GUARDIA_URL,
  COFPONTEVEDRA_MUNICIPIOS_URL,
  COFPONTEVEDRA_PROVINCE,
  COFPONTEVEDRA_PROVINCE_CODE,
  formatDateForCofpo,
  parseCofpontevedraItems,
  type CofpontevedraMunicipio,
} from '../parsers/cofpontevedra.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';
import { getSpainToday } from '../utils/spain-date.util';
import type { ScrapeResult } from '../interfaces/scraper.interfaces';

/** Pausa entre peticiones a la API (ms) — respetar el rate limit */
const REQUEST_DELAY_MS = 150;

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: '*/*',
  Origin: 'https://cofpo.org',
  Referer: 'https://cofpo.org/',
};

@Injectable()
export class CofpontevedraScraperService {
  private readonly logger = new Logger(CofpontevedraScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleWriter: ScheduleWriterService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF Pontevedra...');
    await this.scrapeToday();
  }

  async scrapeToday(): Promise<ScrapeResult> {
    const today = getSpainToday();
    await cleanOldSchedules(this.prisma, this.logger, 'COF Pontevedra');
    return this.scrapeForDate(today);
  }

  async scrapeForDate(targetDate: Date): Promise<ScrapeResult> {
    // 1. Obtener lista de municipios
    const municipios = await this.fetchMunicipios();
    if (municipios.length === 0) {
      this.logger.warn('⚠️  COF Pontevedra: no se obtuvo la lista de municipios');
      return { saved: 0, errors: 1, municipalities: 0 };
    }
    this.logger.debug(`📋 COF Pontevedra: ${municipios.length} municipios a consultar`);

    // 2. Scraping de cada municipio con pequeña pausa entre peticiones
    let totalSaved = 0;
    for (const municipio of municipios) {
      const saved = await this.scrapeMunicipio(municipio, targetDate);
      totalSaved += saved;
      await sleep(REQUEST_DELAY_MS);
    }

    this.logger.log(`✅ COF Pontevedra: ${totalSaved} turnos guardados en total`);
    return { saved: totalSaved, errors: 0, municipalities: municipios.length };
  }

  // ── Métodos privados ──────────────────────────────────────────────────────

  private async fetchMunicipios(): Promise<CofpontevedraMunicipio[]> {
    try {
      const response = await axios.post<CofpontevedraMunicipio[]>(
        COFPONTEVEDRA_MUNICIPIOS_URL,
        null,
        { timeout: 15_000, headers: COMMON_HEADERS },
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      this.logger.warn(
        `⚠️  No se pudo obtener municipios de COF Pontevedra: ${(err as Error).message}`,
      );
      return [];
    }
  }

  private async scrapeMunicipio(
    municipio: CofpontevedraMunicipio,
    targetDate: Date,
  ): Promise<number> {
    const dateStr = formatDateForCofpo(targetDate);
    const sourceUrl = `${COFPONTEVEDRA_GUARDIA_URL}?municipio=${municipio.id}&fecha=${dateStr}`;

    let data: unknown;
    try {
      const response = await axios.post<unknown>(
        `${COFPONTEVEDRA_GUARDIA_URL}?`,
        `search_idmunicipio=${municipio.id}&search_fecha=${dateStr}`,
        {
          timeout: 10_000,
          headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      data = response.data;
    } catch (err) {
      this.logger.warn(
        `⚠️  ${municipio.nombre}: error al consultar la API — ${(err as Error).message}`,
      );
      return 0;
    }

    const schedules = parseCofpontevedraItems(data, targetDate, sourceUrl);
    if (schedules.length === 0) return 0;

    this.logger.debug(`  📋 ${municipio.nombre}: ${schedules.length} farmacia(s) de guardia`);
    const { saved } = await this.scheduleWriter.upsertSchedules(
      { name: COFPONTEVEDRA_PROVINCE, code: COFPONTEVEDRA_PROVINCE_CODE },
      schedules,
    );
    return saved;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
