import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import {
  buildCoflugoUrl,
  COFLUGO_MUNICIPIOS,
  COFLUGO_PROVINCE,
  COFLUGO_PROVINCE_CODE,
  parseCoflugoHtml,
} from '../parsers/coflugo.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';

/** Pausa entre peticiones (ms) — respetar el rate limit del servidor */
const REQUEST_DELAY_MS = 200;

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

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF Lugo...');
    await this.scrapeToday();
  }

  async scrapeToday(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await cleanOldSchedules(this.prisma, this.logger, 'COF Lugo');
    await this.scrapeForDate(today);
  }

  async scrapeForDate(targetDate: Date): Promise<void> {
    this.logger.debug(
      `🔍 COF Lugo: consultando ${COFLUGO_MUNICIPIOS.length} municipios para ${targetDate.toISOString().slice(0, 10)}`,
    );

    let totalSaved = 0;

    for (const municipio of COFLUGO_MUNICIPIOS) {
      const saved = await this.scrapeMunicipio(municipio, targetDate);
      totalSaved += saved;
      await sleep(REQUEST_DELAY_MS);
    }

    this.logger.log(`✅ COF Lugo: ${totalSaved} turnos guardados en total`);
  }

  // ── Métodos privados ──────────────────────────────────────────────────────

  private async scrapeMunicipio(
    municipio: { id: number; nombre: string },
    targetDate: Date,
  ): Promise<number> {
    const url = buildCoflugoUrl(municipio.id, targetDate);

    let html: string;
    try {
      const response = await axios.get<string>(url, {
        timeout: 10_000,
        headers: COMMON_HEADERS,
        responseType: 'text',
      });
      html = response.data;
    } catch (err) {
      this.logger.warn(
        `⚠️  ${municipio.nombre}: error al consultar COFLugo — ${(err as Error).message}`,
      );
      return 0;
    }

    const schedules = parseCoflugoHtml(html, municipio.nombre, targetDate, url);
    if (schedules.length === 0) return 0;

    this.logger.debug(`  📋 ${municipio.nombre}: ${schedules.length} farmacia(s) de guardia`);

    return this.upsertSchedules(schedules);
  }

  private async upsertSchedules(schedules: ScrapedDutySchedule[]): Promise<number> {
    const provinceRecord = await this.prisma.province.upsert({
      where: { code: COFLUGO_PROVINCE_CODE },
      update: {},
      create: { name: COFLUGO_PROVINCE, code: COFLUGO_PROVINCE_CODE },
    });

    let saved = 0;

    for (const schedule of schedules) {
      try {
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

        const existing = await this.prisma.pharmacy.findFirst({
          where: {
            name: schedule.pharmacy.name,
            address: schedule.pharmacy.address,
            cityId: city.id,
          },
          select: { id: true },
        });

        const pharmacy = await this.prisma.pharmacy.upsert({
          where: { id: existing?.id ?? 'new' },
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

        // PostGIS location
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
        this.logger.warn(
          `⚠️  Error al guardar ${schedule.pharmacy.name}: ${(err as Error).message}`,
        );
      }
    }

    return saved;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
