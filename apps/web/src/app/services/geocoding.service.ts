import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeocodingSuggestion {
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

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
          limit: '6',
          countrycodes: 'es',
          'accept-language': 'es',
        },
        headers: {
          'User-Agent': 'FarmaciasGuardiaApp/1.0',
        },
      })
      .pipe(
        map((results) =>
          results.map((r) => ({
            displayName: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          })),
        ),
      );
  }
}

