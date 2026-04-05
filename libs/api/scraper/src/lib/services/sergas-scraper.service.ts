import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import { parseSergasHtml, SERGAS_URLS } from '../parsers/sergas.parser';

@Injectable()
export class SergasScraperService {
  private readonly logger = new Logger(SergasScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta el scraping automáticamente cada día a las 06:00.
   * También puede invocarse manualmente con scrapeAll().
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado del SERGAS...');
    await this.scrapeAll();
  }

  /**
   * Scraping de todas las provincias gallegas para hoy.
   */
  async scrapeAll(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await Promise.allSettled(
      Object.entries(SERGAS_URLS).map(([province, url]) =>
        this.scrapeProvince(province, url, today),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(
      `✅ Scraping completado: ${succeeded} provincias OK, ${failed} fallidas`,
    );
  }

  /**
   * Scraping de una provincia concreta.
   * Falla silenciosamente — no corrompe datos existentes.
   */
  async scrapeProvince(
    province: string,
    url: string,
    date: Date,
  ): Promise<void> {
    this.logger.debug(`🔍 Scraping ${province}...`);

    let html: string;
    try {
      const response = await axios.get<string>(url, {
        timeout: 15_000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; FarmaciasGuardiaBot/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
        // Seguir redirects automáticamente
        maxRedirects: 5,
      });
      html = response.data;
    } catch (err) {
      this.logger.warn(
        `⚠️  No se pudo descargar ${province} (${url}): ${(err as Error).message}`,
      );
      return; // Fallo silencioso — no lanza excepción
    }

    const schedules = parseSergasHtml(html, province, date, url);

    if (schedules.length === 0) {
      this.logger.warn(
        `⚠️  ${province}: HTML descargado pero 0 farmacias parseadas. ` +
          `La estructura puede haber cambiado.`,
      );
      return;
    }

    this.logger.debug(`📋 ${province}: ${schedules.length} farmacias encontradas`);
    await this.upsertSchedules(schedules, province);
  }

  /**
   * Guarda los turnos en la BD usando upsert (no duplica ni corrompe datos).
   */
  private async upsertSchedules(
    schedules: ScrapedDutySchedule[],
    province: string,
  ): Promise<void> {
    // Asegurar que la provincia existe
    const provinceRecord = await this.prisma.province.upsert({
      where: { code: 'GA' },
      update: {},
      create: { name: 'Galicia', code: 'GA' },
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

        // Upsert de la farmacia (identificada por nombre + dirección)
        const pharmacy = await this.prisma.pharmacy.upsert({
          where: {
            // Usamos un índice compuesto simulado buscando primero
            id: await this.findPharmacyId(
              schedule.pharmacy.name,
              schedule.pharmacy.address,
              city.id,
            ),
          },
          update: {
            phone: schedule.pharmacy.phone ?? undefined,
          },
          create: {
            name: schedule.pharmacy.name,
            address: schedule.pharmacy.address,
            phone: schedule.pharmacy.phone,
            cityId: city.id,
          },
        });

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

    this.logger.log(
      `💾 ${province}: ${saved} turnos guardados, ${skipped} omitidos`,
    );
  }

  /**
   * Busca el ID de una farmacia por nombre+dirección+ciudad.
   * Retorna un ID ficticio si no existe (para que upsert use el create).
   */
  private async findPharmacyId(
    name: string,
    address: string,
    cityId: string,
  ): Promise<string> {
    const existing = await this.prisma.pharmacy.findFirst({
      where: { name, address, cityId },
      select: { id: true },
    });
    return existing?.id ?? 'new'; // 'new' garantiza que no existe → usa create
  }
}

