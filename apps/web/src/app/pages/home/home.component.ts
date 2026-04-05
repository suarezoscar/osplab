import { Component, inject, signal } from '@angular/core';
import { PharmaciesApiService } from '../../services/pharmacies-api.service';
import { GeolocationService } from '../../services/geolocation.service';
import type { PharmacyDto } from '@farmacias-guardia/shared-interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly pharmaciesApi = inject(PharmaciesApiService);
  private readonly geo = inject(GeolocationService);

  readonly pharmacies = signal<PharmacyDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searched = signal(false);

  async search(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.pharmacies.set([]);

    try {
      const coords = await this.geo.getCurrentPosition();
      this.pharmaciesApi.findNearby({ lat: coords.lat, lng: coords.lng }).subscribe({
        next: (results) => {
          this.pharmacies.set(results);
          this.searched.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al conectar con el servidor. ¿Está el API en marcha?');
          this.loading.set(false);
        },
      });
    } catch (err) {
      this.error.set((err as Error).message);
      this.loading.set(false);
    }
  }

  formatDistance(meters: number | undefined): string {
    if (!meters) return '';
    return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
  }
}

