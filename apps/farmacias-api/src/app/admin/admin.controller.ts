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
import type { ScrapeResult } from '@osplab/farmacias-scraper';
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
  @HttpCode(HttpStatus.OK)
  async triggerCofourenseScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.cofourenseScraper.scrapeToday();
    return {
      message: `COF Ourense: ${result.saved} turnos guardados, ${result.errors} errores`,
      result,
    };
  }

  @Post('scrape/cofpontevedra')
  @HttpCode(HttpStatus.OK)
  async triggerCofpontevedraScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.cofpontevedraScraper.scrapeToday();
    return {
      message: `COF Pontevedra: ${result.saved} turnos guardados, ${result.errors} errores (${result.municipalities} municipios)`,
      result,
    };
  }

  @Post('scrape/coflugo')
  @HttpCode(HttpStatus.OK)
  async triggerCoflugoScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.coflugoScraper.scrapeToday();
    return {
      message: `COF Lugo: ${result.saved} turnos guardados, ${result.errors} errores (${result.municipalities} municipios)`,
      result,
    };
  }

  @Post('scrape/cofc')
  @HttpCode(HttpStatus.OK)
  async triggerCofcScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.cofcScraper.scrapeToday();
    return {
      message: `COF A Coruña: ${result.saved} turnos guardados, ${result.errors} errores (${result.municipalities} municipios)`,
      result,
    };
  }

  @Post('scrape/cofm')
  @HttpCode(HttpStatus.OK)
  async triggerCofmScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.cofmScraper.scrapeToday();
    return {
      message: `COFM Madrid: ${result.saved} turnos guardados, ${result.errors} errores`,
      result,
    };
  }

  @Post('scrape/farmaguia')
  @HttpCode(HttpStatus.OK)
  async triggerFarmaguiaScrape(): Promise<{ message: string; result: ScrapeResult }> {
    const result = await this.farmaguiaScraper.scrapeToday();
    return {
      message: `Farmaguia Barcelona: ${result.saved} turnos guardados, ${result.errors} errores (${result.municipalities} provincias)`,
      result,
    };
  }
}
