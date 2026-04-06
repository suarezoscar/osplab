import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeocodingSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
  addresstype: string;
}

/** Tipos de resultado que queremos priorizar (de mayor a menor relevancia) */
const ADDRESS_TYPE_PRIORITY: Record<string, number> = {
  city: 10,
  town: 9,
  village: 8,
  municipality: 7,
  county: 5,
  state_district: 4,
  province: 3,
  state: 2,
  administrative: 1,
};

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  /**
   * Busca lugares en España usando Nominatim (OpenStreetMap).
   * Requiere al menos 3 caracteres. Max 1 req/seg — usar con debounce.
   */
  search(query: string): Observable<GeocodingSuggestion[]> {
    return this.http
      .get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: '10', // pedimos más para poder filtrar mejor
          countrycodes: 'es',
          addressdetails: '1',
          'accept-language': 'es',
        },
        headers: { 'User-Agent': 'FarmaciasGuardiaApp/1.0' },
      })
      .pipe(
        map((results) => {
          // Agrupar por display_name normalizado → quedarse con el mejor de cada grupo
          const groups = new Map<string, NominatimResult>();

          for (const r of results) {
            const key = r.display_name.trim().toLowerCase();
            const existing = groups.get(key);

            if (!existing) {
              groups.set(key, r);
            } else {
              // Preferir el resultado con tipo más específico, luego mayor importance
              const newPriority = ADDRESS_TYPE_PRIORITY[r.addresstype] ?? 0;
              const curPriority = ADDRESS_TYPE_PRIORITY[existing.addresstype] ?? 0;
              if (
                newPriority > curPriority ||
                (newPriority === curPriority && r.importance > existing.importance)
              ) {
                groups.set(key, r);
              }
            }
          }

          return Array.from(groups.values()).map((r) => ({
            displayName: r.display_name.trim(),
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          }));
        }),
      );
  }
}
