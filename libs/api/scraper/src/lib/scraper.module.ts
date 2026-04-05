import { Module } from '@nestjs/common';
import { DataAccessModule } from '@farmacias-guardia/api-data-access';
import { SergasScraperService } from './services/sergas-scraper.service';
import { CofourenseScraperService } from './services/cofourense-scraper.service';

@Module({
  imports: [DataAccessModule],
  providers: [SergasScraperService, CofourenseScraperService],
  exports: [SergasScraperService, CofourenseScraperService],
})
export class ScraperModule {}

