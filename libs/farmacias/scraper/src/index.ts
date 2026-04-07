export { ScraperModule } from './lib/scraper.module';
export { CofourenseScraperService } from './lib/services/cofourense-scraper.service';
export { CofpontevedraScraperService } from './lib/services/cofpontevedra-scraper.service';
export { CoflugoScraperService } from './lib/services/coflugo-scraper.service';
export { CofcScraperService } from './lib/services/cofc-scraper.service';
export { CofmScraperService } from './lib/services/cofm-scraper.service';
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
export {
  parseCofcResponse,
  formatDateForCofc,
  buildCofcCoordsMap,
  parseCofcSchedule,
  COFC_API_URL,
  COFC_PROVINCE,
  COFC_PROVINCE_CODE,
  COFC_MUNICIPIOS,
} from './lib/parsers/cofc.parser';
export type { CofcApiResponse, CofcMapItem } from './lib/parsers/cofc.parser';
export {
  parseCofmResponse,
  parseCofmCoordinates,
  parseCofmSchedule,
  buildCofmPharmacyName,
  COFM_API_URL,
  COFM_PROVINCE,
  COFM_PROVINCE_CODE,
} from './lib/parsers/cofm.parser';
export type { CofmPharmacy } from './lib/parsers/cofm.parser';
export type {
  ScrapedDutySchedule,
  ScrapedPharmacy,
  ScraperResult,
} from './lib/interfaces/scraper.interfaces';
export {
  getSpainToday,
  formatSpainDate,
  formatSpainDateDMY,
  formatSpainTime,
} from './lib/utils/spain-date.util';
