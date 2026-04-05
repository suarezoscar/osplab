import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SergasScraperService } from '@farmacias-guardia/api-scraper';

/**
 * Endpoint de administración para disparar el scraping manualmente.
 * POST /api/admin/scrape/sergas
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly sergasScraper: SergasScraperService) {}

  @Post('scrape/sergas')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSergasScrape(): Promise<{ message: string }> {
    // Lanzar en background sin bloquear la respuesta
    this.sergasScraper.scrapeAll().catch(() => void 0);
    return { message: 'Scraping del SERGAS iniciado en background' };
  }
}

