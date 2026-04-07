import { Module } from '@nestjs/common';
import { DataAccessModule } from '@osplab/farmacias-data-access';
import { CofourenseScraperService } from './services/cofourense-scraper.service';
import { CofpontevedraScraperService } from './services/cofpontevedra-scraper.service';
import { CoflugoScraperService } from './services/coflugo-scraper.service';
import { CofcScraperService } from './services/cofc-scraper.service';
import { CofmScraperService } from './services/cofm-scraper.service';

@Module({
  imports: [DataAccessModule],
  providers: [
    CofourenseScraperService,
    CofpontevedraScraperService,
    CoflugoScraperService,
    CofcScraperService,
    CofmScraperService,
  ],
  exports: [
    CofourenseScraperService,
    CofpontevedraScraperService,
    CoflugoScraperService,
    CofcScraperService,
    CofmScraperService,
  ],
})
export class ScraperModule {}
