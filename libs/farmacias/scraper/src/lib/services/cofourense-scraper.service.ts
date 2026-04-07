import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import {
  buildCofourenseUrl,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
  parseCofourenseResponse,
} from '../parsers/cofourense.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';
import { getSpainToday } from '../utils/spain-date.util';

@Injectable()
export class CofourenseScraperService {
  private readonly logger = new Logger(CofourenseScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleWriter: ScheduleWriterService,
  ) {}

  /**
   * Ejecuta el scraping automáticamente cada día a las 06:00.
   * También puede invocarse manualmente con scrapeToday().
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF Ourense...');
    await this.scrapeToday();
  }

  /**
   * Scraping de las farmacias de guardia de Ourense para hoy.
   */
  async scrapeToday(): Promise<void> {
    const now = new Date();
    const today = getSpainToday();

    await cleanOldSchedules(this.prisma, this.logger, 'COF Ourense');
    await this.scrapeForDate(now, today);
  }

  /**
   * Scraping de las farmacias de guardia de Ourense para una fecha concreta.
   *
   * @param queryDate - Fecha/hora usada para construir la URL (ahora mismo)
   * @param targetDate - Fecha de guardia a almacenar (sin hora)
   */
  async scrapeForDate(queryDate: Date, targetDate: Date): Promise<void> {
    const url = buildCofourenseUrl(queryDate);
    this.logger.debug(`🔍 Consultando API COF Ourense: ${url}`);

    let data: unknown;
    try {
      const response = await axios.get<unknown>(url, {
        timeout: 15_000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9',
          Referer: 'https://www.cofourense.es/buscador-de-farmacias-de-guardia/',
        },
        maxRedirects: 5,
      });
      data = response.data;
    } catch (err) {
      this.logger.warn(`⚠️  No se pudo consultar la API de COF Ourense: ${(err as Error).message}`);
      return; // Fallo silencioso
    }

    const schedules = parseCofourenseResponse(data, targetDate, url);

    if (schedules.length === 0) {
      this.logger.warn(
        `⚠️  COF Ourense: respuesta recibida pero 0 farmacias parseadas. ` +
          `La estructura de la API puede haber cambiado.`,
      );
      return;
    }

    this.logger.debug(`📋 COF Ourense: ${schedules.length} farmacias de guardia encontradas`);

    const { saved, skipped } = await this.scheduleWriter.upsertSchedules(
      { name: COFOURENSE_PROVINCE, code: COFOURENSE_PROVINCE_CODE },
      schedules,
    );
    this.logger.log(`💾 COF Ourense: ${saved} turnos guardados, ${skipped} omitidos`);
  }
}
