export { ScraperModule } from './lib/scraper.module';
export { SergasScraperService } from './lib/services/sergas-scraper.service';
export { CofourenseScraperService } from './lib/services/cofourense-scraper.service';
export { parseSergasHtml, parseTimeRange, SERGAS_URLS } from './lib/parsers/sergas.parser';
export {
  parseCofourenseResponse,
  buildCofourenseUrl,
  parseApiTime,
  parseCoordinates,
  COFOURENSE_API_BASE,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
} from './lib/parsers/cofourense.parser';
export type { ScrapedDutySchedule, ScrapedPharmacy, ScraperResult } from './lib/interfaces/scraper.interfaces';
