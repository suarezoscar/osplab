import { Injectable, signal } from '@angular/core';

/** Coordenadas geográficas WGS-84. */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Envuelve la API `navigator.geolocation` del navegador
 * y expone signals reactivos para el estado de la petición.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly coordinates = signal<Coordinates | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  /** Solicita la posición actual del usuario con alta precisión. */
  getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Tu navegador no soporta geolocalización';
        this.error.set(msg);
        reject(new Error(msg));
        return;
      }
      this.loading.set(true);
      this.error.set(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.coordinates.set(coords);
          this.loading.set(false);
          resolve(coords);
        },
        (err) => {
          const msg =
            err.code === err.PERMISSION_DENIED
              ? 'Permiso de ubicación denegado. Actívalo en tu navegador.'
              : 'No se pudo obtener tu ubicación. Inténtalo de nuevo.';
          this.error.set(msg);
          this.loading.set(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }
}
