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
 * Patrón fire-and-forget: devuelven 202 Accepted de inmediato y
 * ejecutan el scraping en background. Esto evita timeouts en proxies
 * (Render, Cloudflare) para scrapers lentos como COF Lugo (~60 s).
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
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofourenseScrape(): { message: string } {
    this.cofourenseScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ COF Ourense scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de COF Ourense iniciado en background' };
  }

  @Post('scrape/cofpontevedra')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofpontevedraScrape(): { message: string } {
    this.cofpontevedraScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ COF Pontevedra scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de COF Pontevedra iniciado en background' };
  }

  @Post('scrape/coflugo')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCoflugoScrape(): { message: string } {
    this.coflugoScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ COF Lugo scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de COF Lugo iniciado en background' };
  }

  @Post('scrape/cofc')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofcScrape(): { message: string } {
    this.cofcScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ COF A Coruña scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de COF A Coruña iniciado en background' };
  }

  @Post('scrape/cofm')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofmScrape(): { message: string } {
    this.cofmScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ COFM Madrid scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de COFM Madrid iniciado en background' };
  }

  @Post('scrape/farmaguia')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerFarmaguiaScrape(): { message: string } {
    this.farmaguiaScraper.scrapeToday().catch((err) => {
      this.logger.error(`❌ Farmaguia Barcelona scraping falló: ${err.message}`, err.stack);
    });
    return { message: 'Scraping de Farmaguia Barcelona iniciado en background' };
  }
}
