/**
 * Interfaces de entrada para ScheduleWriterService.
 *
 * Se definen aquí (data-access) y no se importan desde scraper
 * para evitar dependencias circulares (scraper → data-access → scraper).
 * Son estructuralmente compatibles con ScrapedDutySchedule / ScrapedPharmacy.
 */

export interface UpsertPharmacyInput {
  name: string;
  ownerName?: string;
  address: string;
  phone?: string;
  cityName: string;
  provinceName: string;
  lat?: number;
  lng?: number;
}

export interface UpsertScheduleInput {
  pharmacy: UpsertPharmacyInput;
  date: Date;
  startTime: string;
  endTime: string;
  sourceUrl: string;
}

export interface ProvinceRef {
  name: string;
  code: string;
}

export interface UpsertResult {
  saved: number;
  skipped: number;
}
