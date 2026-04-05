import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SergasScraperService, CofourenseScraperService } from '@farmacias-guardia/api-scraper';

/**
 * Endpoints de administración para disparar el scraping manualmente.
 * POST /api/admin/scrape/sergas
 * POST /api/admin/scrape/cofourense
 */
@Controller('admin')
export class AdminController {
  constructor(
    private readonly sergasScraper: SergasScraperService,
    private readonly cofourenseScraper: CofourenseScraperService,
  ) {}

  @Post('scrape/sergas')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSergasScrape(): Promise<{ message: string }> {
    this.sergasScraper.scrapeAll().catch(() => void 0);
    return { message: 'Scraping del SERGAS iniciado en background' };
  }

  @Post('scrape/cofourense')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCofourenseScrape(): Promise<{ message: string }> {
    this.cofourenseScraper.scrapeToday().catch(() => void 0);
    return { message: 'Scraping de COF Ourense iniciado en background' };
  }
}


