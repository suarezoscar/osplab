export interface ScrapedPharmacy {
  name: string;
  /** Nombre del titular/propietario cuando la fuente lo distingue del nombre comercial. */
  ownerName?: string;
  address: string;
  phone?: string;
  cityName: string;
  provinceName: string;
  /** Coordenadas opcionales si la fuente las proporciona */
  lat?: number;
  lng?: number;
}

export interface ScrapedDutySchedule {
  pharmacy: ScrapedPharmacy;
  date: Date;
  startTime: string; // "09:00"
  endTime: string; // "21:00"
  /** URL de la página fuente */
  sourceUrl: string;
}

export interface ScraperResult {
  success: boolean;
  schedules: ScrapedDutySchedule[];
  errors: string[];
  scrapedAt: Date;
}
