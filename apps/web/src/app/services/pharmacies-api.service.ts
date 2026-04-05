import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PharmacyDto, NearbyPharmaciesQuery } from '@farmacias-guardia/shared-interfaces';

@Injectable({ providedIn: 'root' })
export class PharmaciesApiService {
  private readonly http = inject(HttpClient);

  findNearby(query: NearbyPharmaciesQuery): Observable<PharmacyDto[]> {
    let params = new HttpParams()
      .set('lat', query.lat.toString())
      .set('lng', query.lng.toString())
      .set('radiusMeters', (query.radiusMeters ?? 5000).toString());

    if (query.date) {
      params = params.set('date', query.date);
    }

    return this.http.get<PharmacyDto[]>('/api/pharmacies/nearby', { params });
  }
}

