import { Component, OnDestroy, inject, signal, output, viewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
  forkJoin,
  map,
} from 'rxjs';
import * as L from 'leaflet';

// Fix Leaflet default marker icon broken by bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapCoords {
  lat: number;
  lng: number;
}

interface SearchResult {
  displayName: string;
  lat: number;
  lng: number;
}

/** Photon (Komoot) — good for place names / fuzzy search */
interface PhotonResponse {
  features: {
    geometry: { coordinates: [number, number] };
    properties: {
      name?: string;
      housenumber?: string;
      street?: string;
      district?: string;
      city?: string;
      county?: string;
      state?: string;
      country?: string;
      postcode?: string;
    };
  }[];
}

/** Nominatim — good for street addresses with numbers */
interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Toggle button -->
    @if (!mapVisible()) {
      <button
        type="button"
        (click)="showMap()"
        class="flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-[0.88rem] transition-colors"
        style="border-color: var(--osp-border); color: var(--osp-text-muted)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Añadir ubicación en mapa
      </button>
    }

    @if (mapVisible()) {
      <!-- Search (z-[1000] to stay above Leaflet's internal z-indexes) -->
      <div class="relative z-1000 mb-2">
        <input
          type="text"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
          (focus)="showSuggestions.set(suggestions().length > 0)"
          (blur)="onBlurSearch()"
          placeholder="Buscar dirección…"
          name="mapSearch"
          class="ev-input pr-10!"
          autocomplete="off"
        />

        @if (searching()) {
          <div class="absolute right-3 top-3 text-[0.78rem]" style="color: var(--osp-text-faint)">
            Buscando…
          </div>
        }

        <!-- Suggestions dropdown -->
        @if (showSuggestions() && suggestions().length > 0) {
          <ul
            class="absolute mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-xl"
            style="border-color: var(--osp-border); background: var(--osp-bg-surface)"
          >
            @for (s of suggestions(); track $index) {
              <li>
                <button
                  type="button"
                  (mousedown)="selectSuggestion(s)"
                  class="w-full px-4 py-2.5 text-left text-[0.88rem] transition-colors hover:bg-[var(--osp-bg-hover)]"
                  style="color: var(--osp-text)"
                >
                  {{ s.displayName }}
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <p class="mb-2 text-[0.75rem]" style="color: var(--osp-text-faint)">
        También puedes hacer clic en el mapa para fijar la ubicación.
      </p>

      <!-- Map -->
      <div
        #mapContainer
        class="relative z-0 h-56 w-full overflow-hidden rounded-lg border"
        style="border-color: var(--osp-border)"
      ></div>

      <!-- Remove location button -->
      @if (hasCoords()) {
        <button
          type="button"
          (click)="clearLocation()"
          class="mt-2 text-[0.78rem] transition-colors"
          style="color: var(--osp-error)"
        >
          ✕ Quitar ubicación del mapa
        </button>
      }
    }
  `,
})
export class LocationPickerComponent implements OnDestroy {
  private readonly http = inject(HttpClient);

  /** Emits coordinates when user picks a location on the map. Emits null when cleared. */
  coordsSelected = output<MapCoords | null>();

  query = signal('');
  suggestions = signal<{ displayName: string; lat: number; lng: number }[]>([]);
  showSuggestions = signal(false);
  searching = signal(false);
  mapVisible = signal(false);
  hasCoords = signal(false);

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private userLat = 40.4168; // Default: Madrid
  private userLng = -3.7038;
  private gotUserLocation = false;
  private search$ = new Subject<string>();
  private sub = this.search$
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((q) => {
        if (q.length < 3) {
          this.suggestions.set([]);
          return of([] as SearchResult[]);
        }
        this.searching.set(true);

        // Query both APIs in parallel for best results
        const photon$ = this.searchPhoton(q);
        const nominatim$ = this.searchNominatim(q);

        return forkJoin([photon$, nominatim$]).pipe(
          map(([photonResults, nominatimResults]) =>
            this.mergeAndDeduplicate(photonResults, nominatimResults),
          ),
        );
      }),
    )
    .subscribe((results) => {
      this.searching.set(false);
      this.suggestions.set(results);
      this.showSuggestions.set(results.length > 0);
    });

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.map?.remove();
  }

  showMap(): void {
    this.mapVisible.set(true);
    this.requestUserLocation();
    setTimeout(() => this.initMap(), 0);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.search$.next(value);
  }

  onBlurSearch(): void {
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  selectSuggestion(s: { displayName: string; lat: number; lng: number }): void {
    this.query.set(s.displayName);
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.placePin(s.lat, s.lng);
    this.map?.setView([s.lat, s.lng], 16);
  }

  clearLocation(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    this.hasCoords.set(false);
    this.coordsSelected.emit(null);
  }

  // ── Private ────────────────────────────────────────────────────────────

  private initMap(): void {
    const el = this.mapContainer()?.nativeElement;
    if (!el || this.map) return;

    const center: L.LatLngExpression = [this.userLat, this.userLng];
    const zoom = this.gotUserLocation ? 13 : 6;

    this.map = L.map(el, { zoomControl: false, attributionControl: false }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Click to pin
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placePin(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private placePin(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.hasCoords.set(true);
    this.coordsSelected.emit({ lat, lng });
  }

  /** Photon: better for place names and fuzzy search. */
  private searchPhoton(q: string) {
    const params: Record<string, string> = { q, limit: '5' };
    if (this.gotUserLocation) {
      params['lat'] = this.userLat.toString();
      params['lon'] = this.userLng.toString();
    }

    return this.http.get<PhotonResponse>('https://photon.komoot.io/api/', { params }).pipe(
      map((res) =>
        res.features.map((f) => ({
          displayName: this.formatPhotonName(f.properties),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        })),
      ),
      catchError(() => of([] as SearchResult[])),
    );
  }

  /** Nominatim: better for street addresses with numbers. */
  private searchNominatim(q: string) {
    const params: Record<string, string> = {
      q,
      format: 'json',
      limit: '3',
      'accept-language': 'es',
      countrycodes: 'es',
    };

    if (this.gotUserLocation) {
      const offset = 0.5;
      params['viewbox'] = [
        this.userLng - offset,
        this.userLat + offset,
        this.userLng + offset,
        this.userLat - offset,
      ].join(',');
      params['bounded'] = '0';
    }

    return this.http
      .get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
        params,
      })
      .pipe(
        map((results) =>
          results.map((r) => ({
            displayName: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          })),
        ),
        catchError(() => of([] as SearchResult[])),
      );
  }

  /** Merge results from both APIs, deduplicate by proximity (~100m). */
  private mergeAndDeduplicate(photon: SearchResult[], nominatim: SearchResult[]): SearchResult[] {
    const combined = [...photon, ...nominatim];
    const unique: SearchResult[] = [];

    for (const item of combined) {
      const isDupe = unique.some(
        (u) => Math.abs(u.lat - item.lat) < 0.001 && Math.abs(u.lng - item.lng) < 0.001,
      );
      if (!isDupe) unique.push(item);
    }

    return unique.slice(0, 6);
  }

  private formatPhotonName(p: PhotonResponse['features'][number]['properties']): string {
    // Build primary part: "Name" or "Street Number"
    let primary = '';
    if (p.name && p.street) {
      // Named place with address: "Restaurante El Faro, Rúa de Cuba 24"
      const addr = p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
      primary = `${p.name}, ${addr}`;
    } else if (p.street) {
      // Address only: "Rúa de Cuba 24"
      primary = p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
    } else if (p.name) {
      primary = p.name;
    }

    // Context: city, state (deduplicated)
    const context = [p.city ?? p.district ?? p.county, p.state]
      .filter(Boolean)
      .filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

    return [primary, ...context].filter(Boolean).join(', ');
  }

  private requestUserLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.gotUserLocation = true;
        // If map is already open, recenter
        if (this.map && !this.hasCoords()) {
          this.map.setView([this.userLat, this.userLng], 13);
        }
      },
      () => {
        // User denied geolocation — no problem
      },
      { timeout: 5000, maximumAge: 300_000 },
    );
  }
}
