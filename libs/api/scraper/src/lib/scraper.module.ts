import { Module } from '@nestjs/common';
import { DataAccessModule } from '@farmacias-guardia/api-data-access';
import { SergasScraperService } from './services/sergas-scraper.service';
import { CofourenseScraperService } from './services/cofourense-scraper.service';
import { CofpontevedraScraperService } from './services/cofpontevedra-scraper.service';
import { CoflugoScraperService } from './services/coflugo-scraper.service';

@Module({
  imports: [DataAccessModule],
  providers: [SergasScraperService, CofourenseScraperService, CofpontevedraScraperService, CoflugoScraperService],
  exports: [SergasScraperService, CofourenseScraperService, CofpontevedraScraperService, CoflugoScraperService],
})
export class ScraperModule {}

