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
 * Endpoints fire-and-forget: responden 202 Accepted inmediatamente y
 * ejecutan el scraping en background. Los errores del scraper se capturan
 * y loguean sin propagar al caller.
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
    this.logger.log('▶️ Scraping COF Ourense iniciado');
    void this.cofourenseScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ COF Ourense: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ COF Ourense: error — ${err.message}`);
      });
    return { message: 'Scraping de COF Ourense iniciado en background' };
  }

  @Post('scrape/cofpontevedra')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofpontevedraScrape(): { message: string } {
    this.logger.log('▶️ Scraping COF Pontevedra iniciado');
    void this.cofpontevedraScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ COF Pontevedra: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ COF Pontevedra: error — ${err.message}`);
      });
    return { message: 'Scraping de COF Pontevedra iniciado en background' };
  }

  @Post('scrape/coflugo')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCoflugoScrape(): { message: string } {
    this.logger.log('▶️ Scraping COF Lugo iniciado');
    void this.coflugoScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ COF Lugo: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ COF Lugo: error — ${err.message}`);
      });
    return { message: 'Scraping de COF Lugo iniciado en background' };
  }

  @Post('scrape/cofc')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofcScrape(): { message: string } {
    this.logger.log('▶️ Scraping COF A Coruña iniciado');
    void this.cofcScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ COF A Coruña: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ COF A Coruña: error — ${err.message}`);
      });
    return { message: 'Scraping de COF A Coruña iniciado en background' };
  }

  @Post('scrape/cofm')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerCofmScrape(): { message: string } {
    this.logger.log('▶️ Scraping COFM Madrid iniciado');
    void this.cofmScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ COFM Madrid: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ COFM Madrid: error — ${err.message}`);
      });
    return { message: 'Scraping de COFM Madrid iniciado en background' };
  }

  @Post('scrape/farmaguia')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerFarmaguiaScrape(): { message: string } {
    this.logger.log('▶️ Scraping Farmaguia Barcelona iniciado');
    void this.farmaguiaScraper
      .scrapeToday()
      .then((result) => {
        if (result) {
          this.logger.log(`✅ Farmaguia Barcelona: saved=${result.saved}, errors=${result.errors}`);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`❌ Farmaguia Barcelona: error — ${err.message}`);
      });
    return { message: 'Scraping de Farmaguia Barcelona iniciado en background' };
  }
}
