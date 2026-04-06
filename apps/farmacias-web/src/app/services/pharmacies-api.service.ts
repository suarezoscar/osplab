import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PharmacyDto, NearbyPharmaciesQuery } from '@osplab/shared-interfaces';

@Injectable({ providedIn: 'root' })
export class PharmaciesApiService {
  private readonly http = inject(HttpClient);

  findNearest(query: NearbyPharmaciesQuery): Observable<PharmacyDto[]> {
    let params = new HttpParams().set('lat', query.lat.toString()).set('lng', query.lng.toString());

    if (query.date) {
      params = params.set('date', query.date);
    }

    return this.http.get<PharmacyDto[]>('/api/pharmacies/nearest', { params });
  }
}
