import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  CofourenseScraperService,
  CofpontevedraScraperService,
} from '@farmacias-guardia/api-scraper';

/**
 * POST /api/admin/scrape/cofourense
 * POST /api/admin/scrape/cofpontevedra
 */
@Controller('admin')
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
