import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import {
  COFC_API_URL,
  COFC_MUNICIPIOS,
  COFC_PROVINCE,
  COFC_PROVINCE_CODE,
  formatDateForCofc,
  parseCofcResponse,
} from '../parsers/cofc.parser';
import { cleanOldSchedules } from './schedule-cleanup.util';

/** Pausa entre peticiones (ms) — respetar el rate limit */
const REQUEST_DELAY_MS = 300;

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  /** Requerido por el servidor ASP.NET MVC para devolver JSON en lugar de HTML completo */
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.cofc.es/farmacia/index',
};

interface CofcSession {
  token: string;
  cookie: string;
}

@Injectable()
export class CofcScraperService {
  private readonly logger = new Logger(CofcScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('⏰ Iniciando scraping programado de COF A Coruña...');
    await this.scrapeToday();
  }

  async scrapeToday(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await cleanOldSchedules(this.prisma, this.logger, 'COF A Coruña');
    await this.scrapeForDate(today);
  }

  async scrapeForDate(targetDate: Date): Promise<void> {
    this.logger.debug(`📋 COF A Coruña: ${COFC_MUNICIPIOS.length} municipio(s) a consultar`);

    const session = await this.fetchSession();
    if (!session) {
      this.logger.warn('⚠️ COF A Coruña: no se pudo obtener sesión antiforgery, scraping cancelado');
      return;
    }

    let totalSaved = 0;
    for (const municipio of COFC_MUNICIPIOS) {
      const saved = await this.scrapeMunicipio(municipio, targetDate, session);
      totalSaved += saved;
      await sleep(REQUEST_DELAY_MS);
    }

    this.logger.log(`✅ COF A Coruña: ${totalSaved} turno(s) guardados en total`);
  }

  // ── Métodos privados ──────────────────────────────────────────────────────

  /**
   * Obtiene el token antiforgery y la cookie de sesión haciendo un GET inicial.
   * La API de COFC es ASP.NET MVC y requiere CSRF token en cada POST.
   */
  private async fetchSession(): Promise<CofcSession | null> {
    try {
      const resp = await axios.get<string>(COFC_API_URL, {
        headers: {
          'User-Agent': COMMON_HEADERS['User-Agent'],
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15_000,
      });

      const $ = cheerio.load(resp.data);
      const token = $('input[name="__RequestVerificationToken"]').first().val() as string;

      if (!token) {
        this.logger.warn('⚠️ COFC: no se encontró __RequestVerificationToken en la página');
        return null;
      }

      const setCookies = (resp.headers['set-cookie'] as string[] | undefined) ?? [];
      const cookie = setCookies.map((c) => c.split(';')[0]).join('; ');

      return { token, cookie };
    } catch (err) {
      this.logger.warn(`⚠️ COFC: error al obtener sesión — ${(err as Error).message}`);
      return null;
    }
  }

  private async scrapeMunicipio(
    municipio: { id: number; nombre: string },
    targetDate: Date,
    session: CofcSession,
  ): Promise<number> {
    const dateStr = formatDateForCofc(targetDate);
    const sourceUrl = `${COFC_API_URL}?IdPoblacionFiltro=${municipio.id}&fecha=${dateStr}`;

    let data: unknown;
    try {
      const response = await axios.post<unknown>(
        COFC_API_URL,
        `IdPoblacionFiltro=${municipio.id}&FechaBusqueda=${encodeURIComponent(dateStr)}&LatitudFiltro=0&LongitudFiltro=0&__RequestVerificationToken=${encodeURIComponent(session.token)}`,
        {
          timeout: 15_000,
          headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: session.cookie,
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

    const schedules = parseCofcResponse(data, municipio.nombre, targetDate, sourceUrl);

    if (schedules.length === 0) {
      this.logger.debug(`  ℹ️  ${municipio.nombre}: sin farmacias de guardia`);
      return 0;
    }

    this.logger.debug(`  📋 ${municipio.nombre}: ${schedules.length} farmacia(s) de guardia`);
    return this.upsertSchedules(schedules);
  }

  private async upsertSchedules(schedules: ScrapedDutySchedule[]): Promise<number> {
    const provinceRecord = await this.prisma.province.upsert({
      where: { code: COFC_PROVINCE_CODE },
      update: {},
      create: { name: COFC_PROVINCE, code: COFC_PROVINCE_CODE },
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
          update: { phone: schedule.pharmacy.phone ?? undefined },
          create: {
            name: schedule.pharmacy.name,
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
