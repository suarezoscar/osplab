export enum DutyType {
  REGULAR = 'REGULAR',
  URGENT = 'URGENT',
  HOLIDAY = 'HOLIDAY',
}

export interface PharmacyDto {
  id: string;
  name: string;
  /** Nombre del titular cuando la fuente lo distingue del nombre comercial. */
  ownerName?: string | null;
  address: string;
  phone?: string | null;
  city: string;
  province: string;
  distance?: number; // metros, calculado por PostGIS
  startTime?: string; // "09:00"
  endTime?: string; // "21:00"
  lat?: number;
  lng?: number;
}

export interface DutyScheduleDto {
  id: string;
  pharmacyId: string;
  date: string; // ISO date "2024-01-15"
  startTime: string; // "09:00"
  endTime: string; // "21:00"
  type: DutyType;
  source?: string | null;
}

export interface NearbyPharmaciesQuery {
  lat: number;
  lng: number;
  date?: string; // ISO date, default: hoy
}

export interface ProvinceDto {
  id: string;
  name: string;
  code: string;
}

export interface CityDto {
  id: string;
  name: string;
  provinceId: string;
}
