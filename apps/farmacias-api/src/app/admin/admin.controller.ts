import { Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  CofourenseScraperService,
  CofpontevedraScraperService,
  CoflugoScraperService,
  CofcScraperService,
  CofmScraperService,
  FarmaguiaScraperService,
} from '@osplab/farmacias-scraper';
import { AdminApiKeyGuard } from './admin-api-key.guard';

/**
 * POST /api/admin/scrape/cofourense
 * POST /api/admin/scrape/cofpontevedra
 * POST /api/admin/scrape/coflugo
 * POST /api/admin/scrape/cofc
 * POST /api/admin/scrape/cofm
 * POST /api/admin/scrape/farmaguia
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
    private readonly coflugoScraper: CoflugoScraperService,
    private readonly cofcScraper: CofcScraperService,
    private readonly cofmScraper: CofmScraperService,
    private readonly farmaguiaScraper: FarmaguiaScraperService,
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

  @Post('scrape/coflugo')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCoflugoScrape(): Promise<{ message: string }> {
    this.coflugoScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COF Lugo iniciado en background' };
  }

  @Post('scrape/cofc')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCofcScrape(): Promise<{ message: string }> {
    this.cofcScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COF A Coruña iniciado en background' };
  }

  @Post('scrape/cofm')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCofmScrape(): Promise<{ message: string }> {
    this.cofmScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COFM Madrid iniciado en background' };
  }

  @Post('scrape/farmaguia')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerFarmaguiaScrape(): Promise<{ message: string }> {
    this.farmaguiaScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de Farmaguia Barcelona iniciado en background' };
  }
}
