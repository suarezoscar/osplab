import { Module } from '@nestjs/common';
import { DataAccessModule } from '@farmacias-guardia/api-data-access';
import { SergasScraperService } from './services/sergas-scraper.service';

@Module({
  imports: [DataAccessModule],
  providers: [SergasScraperService],
  exports: [SergasScraperService],
})
export class ScraperModule {}

