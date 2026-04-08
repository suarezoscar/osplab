import { Controller, Post, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
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
import type { ScrapeResult } from '@osplab/farmacias-scraper';

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
 *
 * Endpoints síncronos: esperan a que el scraping termine y devuelven
 * el resultado con 200 OK. El caller puede comprobar `saved > 0` y
 * `errors === 0` para verificar éxito.
 */
@Controller('admin')
@UseGuards(AdminApiKeyGuard)
@SkipThrottle()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

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
  async triggerCofourenseScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping COF Ourense iniciado');
    const result = await this.cofourenseScraper.scrapeToday();
    this.logger.log(`✅ COF Ourense: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }

  @Post('scrape/cofpontevedra')
  @HttpCode(HttpStatus.OK)
  async triggerCofpontevedraScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping COF Pontevedra iniciado');
    const result = await this.cofpontevedraScraper.scrapeToday();
    this.logger.log(`✅ COF Pontevedra: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }

  @Post('scrape/coflugo')
  @HttpCode(HttpStatus.OK)
  async triggerCoflugoScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping COF Lugo iniciado');
    const result = await this.coflugoScraper.scrapeToday();
    this.logger.log(`✅ COF Lugo: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }

  @Post('scrape/cofc')
  @HttpCode(HttpStatus.OK)
  async triggerCofcScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping COF A Coruña iniciado');
    const result = await this.cofcScraper.scrapeToday();
    this.logger.log(`✅ COF A Coruña: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }

  @Post('scrape/cofm')
  @HttpCode(HttpStatus.OK)
  async triggerCofmScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping COFM Madrid iniciado');
    const result = await this.cofmScraper.scrapeToday();
    this.logger.log(`✅ COFM Madrid: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }

  @Post('scrape/farmaguia')
  @HttpCode(HttpStatus.OK)
  async triggerFarmaguiaScrape(): Promise<ScrapeResult> {
    this.logger.log('▶️ Scraping Farmaguia Barcelona iniciado');
    const result = await this.farmaguiaScraper.scrapeToday();
    this.logger.log(`✅ Farmaguia Barcelona: saved=${result.saved}, errors=${result.errors}`);
    return result;
  }
}
