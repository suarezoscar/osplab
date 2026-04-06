export { ScraperModule } from './lib/scraper.module';
export { CofourenseScraperService } from './lib/services/cofourense-scraper.service';
export { CofpontevedraScraperService } from './lib/services/cofpontevedra-scraper.service';
export { CoflugoScraperService } from './lib/services/coflugo-scraper.service';
export {
  parseCoflugoHtml,
  buildCoflugoUrl,
  parseCoflugoOnclick,
  parseCoflugoScheduleType,
  COFLUGO_BASE_URL,
  COFLUGO_PROVINCE,
  COFLUGO_PROVINCE_CODE,
  COFLUGO_MUNICIPIOS,
} from './lib/parsers/coflugo.parser';
export {
  parseCofourenseResponse,
  buildCofourenseUrl,
  parseApiTime,
  parseCoordinates,
  COFOURENSE_API_BASE,
  COFOURENSE_PROVINCE,
  COFOURENSE_PROVINCE_CODE,
} from './lib/parsers/cofourense.parser';
export {
  parseCofpontevedraItems,
  formatDateForCofpo,
  parseObservaciones,
  COFPONTEVEDRA_MUNICIPIOS_URL,
  COFPONTEVEDRA_GUARDIA_URL,
  COFPONTEVEDRA_PROVINCE,
  COFPONTEVEDRA_PROVINCE_CODE,
} from './lib/parsers/cofpontevedra.parser';
export type { CofpontevedraMunicipio } from './lib/parsers/cofpontevedra.parser';
export type {
  ScrapedDutySchedule,
  ScrapedPharmacy,
  ScraperResult,
} from './lib/interfaces/scraper.interfaces';
