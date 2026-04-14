import {
  Component,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  output,
  viewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
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

export interface LocationResult {
  name: string;
  lat: number;
  lng: number;
}

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
    <div class="relative">
      <!-- Search input -->
      <input
        type="text"
        [ngModel]="query()"
        (ngModelChange)="onQueryChange($event)"
        (focus)="showSuggestions.set(suggestions().length > 0)"
        placeholder="Buscar lugar…"
        name="locationSearch"
        class="ev-input"
        autocomplete="off"
      />

      <!-- Suggestions dropdown -->
      @if (showSuggestions() && suggestions().length > 0) {
        <ul
          class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#1a3050] bg-[#0a1929] shadow-xl"
        >
          @for (s of suggestions(); track s.displayName) {
            <li>
              <button
                type="button"
                (click)="selectSuggestion(s)"
                class="w-full px-4 py-2.5 text-left text-[0.88rem] text-[#c8dce8] transition-colors hover:bg-[#f59e0b]/10 hover:text-white"
              >
                {{ s.displayName }}
              </button>
            </li>
          }
        </ul>
      }

      @if (searching()) {
        <div class="absolute right-3 top-3 text-[0.78rem] text-[#4d7a9a]">Buscando…</div>
      }
    </div>

    <!-- Map -->
    @if (selected()) {
      <div
        #mapContainer
        class="mt-3 h-48 w-full overflow-hidden rounded-lg border border-[#1a3050]"
      ></div>
    }
  `,
})
export class LocationPickerComponent implements AfterViewInit, OnDestroy {
  private readonly http = inject(HttpClient);

  /** Emits when user selects a location. */
  locationSelected = output<LocationResult>();

  query = signal('');
  suggestions = signal<{ displayName: string; lat: number; lng: number }[]>([]);
  showSuggestions = signal(false);
  searching = signal(false);
  selected = signal<LocationResult | null>(null);

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private userLat: number | null = null;
  private userLng: number | null = null;
  private search$ = new Subject<string>();
  private sub = this.search$
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((q) => {
        if (q.length < 3) {
          this.suggestions.set([]);
          return of([]);
        }
        this.searching.set(true);

        const params: Record<string, string> = {
          q,
          format: 'json',
          limit: '5',
          'accept-language': 'es',
        };

        // Si tenemos ubicación del usuario, sesgar resultados hacia su zona
        if (this.userLat != null && this.userLng != null) {
          const offset = 0.5; // ~50 km
          params['viewbox'] = [
            this.userLng - offset,
            this.userLat + offset,
            this.userLng + offset,
            this.userLat - offset,
          ].join(',');
          params['bounded'] = '0'; // Priorizar la zona pero no limitar
        }

        return this.http
          .get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
            params,
            headers: { Referer: 'https://osplab.dev' },
          })
          .pipe(catchError(() => of([])));
      }),
    )
    .subscribe((results) => {
      this.searching.set(false);
      const mapped = (results as NominatimResult[]).map((r) => ({
        displayName: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      }));
      this.suggestions.set(mapped);
      this.showSuggestions.set(mapped.length > 0);
    });

  ngAfterViewInit(): void {
    this.requestUserLocation();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.map?.remove();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.search$.next(value);
  }

  selectSuggestion(s: { displayName: string; lat: number; lng: number }): void {
    const result: LocationResult = { name: s.displayName, lat: s.lat, lng: s.lng };
    this.query.set(s.displayName);
    this.selected.set(result);
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.locationSelected.emit(result);

    // Render map after view updates
    setTimeout(() => this.renderMap(s.lat, s.lng), 0);
  }

  private renderMap(lat: number, lng: number): void {
    const el = this.mapContainer()?.nativeElement;
    if (!el) return;

    if (this.map) {
      this.map.setView([lat, lng], 15);
      this.marker?.setLatLng([lat, lng]);
      return;
    }

    this.map = L.map(el, { zoomControl: false, attributionControl: false }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Fix Leaflet tile rendering on dynamic containers
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  /** Pide geolocalización al usuario para mejorar las sugerencias. */
  private requestUserLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
      },
      () => {
        // Si el usuario deniega, seguimos sin ubicación — sin problema
      },
      { timeout: 5000, maximumAge: 300_000 },
    );
  }
}
