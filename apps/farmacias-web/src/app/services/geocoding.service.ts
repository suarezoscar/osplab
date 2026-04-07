import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** Sugerencia normalizada devuelta por el autocompletado de direcciones. */
export interface GeocodingSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

/** Resultado crudo de la API Nominatim. */
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
  addresstype: string;
}

/** Prioridad de tipos de resultado de Nominatim (mayor = más relevante). */
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

/**
 * Geocodificación mediante Nominatim (OpenStreetMap).
 *
 * Deduplica resultados por `display_name` y prioriza los tipos
 * de dirección más específicos para mejorar la relevancia.
 */
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
          limit: '10',
          countrycodes: 'es',
          addressdetails: '1',
          'accept-language': 'es',
        },
        headers: { Referer: 'https://farmacias.osplab.dev' },
      })
      .pipe(
        map((results) => {
          const groups = new Map<string, NominatimResult>();

          for (const r of results) {
            const key = r.display_name.trim().toLowerCase();
            const existing = groups.get(key);

            if (!existing) {
              groups.set(key, r);
            } else {
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
