import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import {
  COFM_API_URL,
  COFM_PROVINCE,
  COFM_PROVINCE_CODE,
  parseCofmResponse,
} from '../parsers/cofm.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';
import { getSpainToday } from '../utils/spain-date.util';

@Injectable()
export class CofmScraperService {
  private readonly logger = new Logger(CofmScraperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleWriter: ScheduleWriterService,
  ) {}

  /**
   * Ejecuta el scraping automáticamente cada día a las 06:05.
   * También puede invocarse manualmente con scrapeToday().
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COFM Madrid...');
    await this.scrapeToday();
  }

  /**
   * Scraping de las farmacias de guardia de Madrid para hoy.
   */
  async scrapeToday(): Promise<void> {
    const today = getSpainToday();

    await cleanOldSchedules(this.prisma, this.logger, 'COFM Madrid');
    await this.scrapeForDate(today);
  }

  /**
   * Scraping de las farmacias de guardia de Madrid para una fecha concreta.
   *
   * La API de COFM devuelve TODAS las farmacias con su estado actual
   * (abierta, guardia, servicio24h). Solo almacenamos las de guardia.
   *
   * @param targetDate - Fecha de guardia a almacenar (sin hora)
   */
  async scrapeForDate(targetDate: Date): Promise<void> {
    const url = COFM_API_URL;
    this.logger.debug(`🔍 Consultando API COFM Madrid: ${url}`);

    let data: unknown;
    try {
      const response = await axios.get<unknown>(url, {
        timeout: 15_000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9',
          Referer: 'https://www.cofm.es/',
        },
        maxRedirects: 5,
      });
      data = response.data;
    } catch (err) {
      this.logger.warn(`⚠️  No se pudo consultar la API de COFM Madrid: ${(err as Error).message}`);
      return; // Fallo silencioso
    }

    const schedules = parseCofmResponse(data, targetDate, url);

    if (schedules.length === 0) {
      this.logger.warn(
        `⚠️  COFM Madrid: respuesta recibida pero 0 farmacias de guardia parseadas. ` +
          `La estructura de la API puede haber cambiado.`,
      );
      return;
    }

    this.logger.debug(`📋 COFM Madrid: ${schedules.length} turnos de guardia encontrados`);

    const { saved, skipped } = await this.scheduleWriter.upsertSchedules(
      { name: COFM_PROVINCE, code: COFM_PROVINCE_CODE },
      schedules,
    );
    this.logger.log(`💾 COFM Madrid: ${saved} turnos guardados, ${skipped} omitidos`);
  }
}
