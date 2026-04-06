import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { PharmaciesApiService } from '../../services/pharmacies-api.service';
import { GeolocationService } from '../../services/geolocation.service';
import { GeocodingService, type GeocodingSuggestion } from '../../services/geocoding.service';
import type { PharmacyDto } from '@farmacias-guardia/shared-interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnDestroy {
  private readonly pharmaciesApi = inject(PharmaciesApiService);
  private readonly geo = inject(GeolocationService);
  private readonly geocoding = inject(GeocodingService);

  // ── Estado principal ──────────────────────────────────────────────────────
  readonly nearest = signal<PharmacyDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searched = signal(false);
  /** true solo cuando la última búsqueda fue por geolocalización exacta */
  readonly searchedByGeo = signal(false);

  // ── Autocompletado ────────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly suggestions = signal<GeocodingSuggestion[]>([]);
  readonly showSuggestions = signal(false);
  readonly loadingSuggestions = signal(false);

  private readonly searchInput$ = new Subject<string>();
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((q) => q.trim().length >= 3),
      switchMap((q) => {
        this.loadingSuggestions.set(true);
        return this.geocoding.search(q);
      }),
    ).subscribe({
      next: (results) => {
        this.suggestions.set(results);
        this.showSuggestions.set(results.length > 0);
        this.loadingSuggestions.set(false);
      },
      error: () => {
        this.suggestions.set([]);
        this.loadingSuggestions.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Handlers del input ────────────────────────────────────────────────────
  onQueryChange(value: string): void {
    this.searchQuery.set(value);
    if (value.trim().length < 3) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    this.searchInput$.next(value);
  }

  selectSuggestion(suggestion: GeocodingSuggestion): void {
    this.searchQuery.set(suggestion.displayName);
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.searchedByGeo.set(false);
    this.findNearest(suggestion.lat, suggestion.lng);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.suggestions.set([]);
    this.showSuggestions.set(false);
  }

  // ── Búsqueda por geolocalización ──────────────────────────────────────────
  async searchByGeo(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.nearest.set(null);
    this.clearSearch();

    try {
      const coords = await this.geo.getCurrentPosition();
      this.searchedByGeo.set(true);
      this.findNearest(coords.lat, coords.lng);
    } catch (err) {
      this.error.set((err as Error).message);
      this.loading.set(false);
    }
  }

  // ── Lógica compartida ─────────────────────────────────────────────────────
  private findNearest(lat: number, lng: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.nearest.set(null);

    this.pharmaciesApi.findNearest({ lat, lng }).subscribe({
      next: (result) => {
        this.nearest.set(result);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor. ¿Está el API en marcha?');
        this.loading.set(false);
      },
    });
  }

  formatDistance(meters: number | undefined): string {
    if (meters === undefined) return '';
    return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
  }
}





