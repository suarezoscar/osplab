import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '@osplab/farmacias-data-access';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
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

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF Pontevedra...');
    await this.scrapeToday();
  }

  async scrapeToday(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await cleanOldSchedules(this.prisma, this.logger, 'COF Pontevedra');
    await this.scrapeForDate(today);
  }

  async scrapeForDate(targetDate: Date): Promise<void> {
    // 1. Obtener lista de municipios
    const municipios = await this.fetchMunicipios();
    if (municipios.length === 0) {
      this.logger.warn('⚠️  COF Pontevedra: no se obtuvo la lista de municipios');
      return;
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
    return this.upsertSchedules(schedules);
  }

  private async upsertSchedules(schedules: ScrapedDutySchedule[]): Promise<number> {
    const provinceRecord = await this.prisma.province.upsert({
      where: { code: COFPONTEVEDRA_PROVINCE_CODE },
      update: {},
      create: { name: COFPONTEVEDRA_PROVINCE, code: COFPONTEVEDRA_PROVINCE_CODE },
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
          create: { name: schedule.pharmacy.cityName, provinceId: provinceRecord.id },
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
          where: { pharmacyId_date: { pharmacyId: pharmacy.id, date: schedule.date } },
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
