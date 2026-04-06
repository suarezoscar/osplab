import { Module } from '@nestjs/common';
import { DataAccessModule } from '@farmacias-guardia/api-data-access';
import { CofourenseScraperService } from './services/cofourense-scraper.service';
import { CofpontevedraScraperService } from './services/cofpontevedra-scraper.service';
import { CoflugoScraperService } from './services/coflugo-scraper.service';

@Module({
  imports: [DataAccessModule],
  providers: [CofourenseScraperService, CofpontevedraScraperService, CoflugoScraperService],
  exports: [CofourenseScraperService, CofpontevedraScraperService, CoflugoScraperService],
})
export class ScraperModule {}

