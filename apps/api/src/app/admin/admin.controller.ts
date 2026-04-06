import { Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  CofourenseScraperService,
  CofpontevedraScraperService,
} from '@farmacias-guardia/api-scraper';
import { AdminApiKeyGuard } from './admin-api-key.guard';

/**
 * POST /api/admin/scrape/cofourense
 * POST /api/admin/scrape/cofpontevedra
 *
 * Protegidos por AdminApiKeyGuard (cabecera X-Admin-Key).
 * SkipThrottle porque estas rutas son llamadas sólo por el propio cron/admin.
 */
@Controller('admin')
@UseGuards(AdminApiKeyGuard)
@SkipThrottle()
export class AdminController {
  constructor(
    private readonly cofourenseScraper: CofourenseScraperService,
    private readonly cofpontevedraScraper: CofpontevedraScraperService,
  ) {}

  @Post('scrape/cofourense')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCofourenseScrape(): Promise<{ message: string }> {
    this.cofourenseScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COF Ourense iniciado en background' };
  }

  @Post('scrape/cofpontevedra')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCofpontevedraScrape(): Promise<{ message: string }> {
    this.cofpontevedraScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COF Pontevedra iniciado en background' };
  }
}
