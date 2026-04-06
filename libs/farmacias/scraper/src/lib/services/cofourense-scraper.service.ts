import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '@osplab/farmacias-data-access';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import {
  buildCofourenseUrl,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
  parseCofourenseResponse,
} from '../parsers/cofourense.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';

@Injectable()
export class CofourenseScraperService {
  private readonly logger = new Logger(CofourenseScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

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
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

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
    await this.upsertSchedules(schedules);
  }

  /**
   * Guarda los turnos en la BD usando upsert (no duplica ni corrompe datos).
   */
  private async upsertSchedules(schedules: ScrapedDutySchedule[]): Promise<void> {
    // Asegurar que la comunidad autónoma / provincia existe
    const provinceRecord = await this.prisma.province.upsert({
      where: { code: COFOURENSE_PROVINCE_CODE },
      update: {},
      create: { name: COFOURENSE_PROVINCE, code: COFOURENSE_PROVINCE_CODE },
    });

    let saved = 0;
    let skipped = 0;

    for (const schedule of schedules) {
      try {
        // Upsert de la ciudad
        const city = await this.prisma.city.upsert({
          where: {
            name_provinceId: {
              name: schedule.pharmacy.cityName,
              provinceId: provinceRecord.id,
            },
          },
          update: {},
          create: {
            name: schedule.pharmacy.cityName,
            provinceId: provinceRecord.id,
          },
        });

        // Upsert de la farmacia (identificada por nombre + dirección + ciudad)
        const pharmacyId = await this.findPharmacyId(
          schedule.pharmacy.name,
          schedule.pharmacy.address,
          city.id,
        );

        const pharmacy = await this.prisma.pharmacy.upsert({
          where: { id: pharmacyId },
          update: {
            phone: schedule.pharmacy.phone ?? undefined,
            ownerName: schedule.pharmacy.ownerName ?? undefined,
          },
          create: {
            name: schedule.pharmacy.name,
            ownerName: schedule.pharmacy.ownerName,
            address: schedule.pharmacy.address,
            phone: schedule.pharmacy.phone,
            cityId: city.id,
          },
        });

        // Actualizar la localización PostGIS si tenemos coordenadas válidas
        if (schedule.pharmacy.lat != null && schedule.pharmacy.lng != null) {
          await this.prisma.$executeRaw`
            UPDATE "Pharmacy"
            SET location = ST_SetSRID(
              ST_MakePoint(${schedule.pharmacy.lng}, ${schedule.pharmacy.lat}),
              4326
            )::geography
            WHERE id = ${pharmacy.id}
          `;
        }

        // Upsert del turno de guardia
        await this.prisma.dutySchedule.upsert({
          where: {
            pharmacyId_date: {
              pharmacyId: pharmacy.id,
              date: schedule.date,
            },
          },
          update: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            source: schedule.sourceUrl,
          },
          create: {
            pharmacyId: pharmacy.id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            source: schedule.sourceUrl,
          },
        });

        saved++;
      } catch (err) {
        skipped++;
        this.logger.warn(
          `⚠️  Error al guardar ${schedule.pharmacy.name}: ${(err as Error).message}`,
        );
        // Continúa con la siguiente farmacia
      }
    }

    this.logger.log(`💾 COF Ourense: ${saved} turnos guardados, ${skipped} omitidos`);
  }

  /**
   * Busca el ID de una farmacia por nombre+dirección+ciudad.
   * Retorna un ID ficticio si no existe (para que upsert use el create).
   */
  private async findPharmacyId(name: string, address: string, cityId: string): Promise<string> {
    const existing = await this.prisma.pharmacy.findFirst({
      where: { name, address, cityId },
      select: { id: true },
    });
    return existing?.id ?? 'new';
  }
}
