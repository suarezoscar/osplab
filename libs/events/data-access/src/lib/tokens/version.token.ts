import { InjectionToken } from '@angular/core';

/** Token para inyectar la versión de la app Events en componentes de la feature lib. */
export const EVENTS_APP_VERSION = new InjectionToken<string>('EVENTS_APP_VERSION', {
  providedIn: 'root',
  factory: () => '0.0.0',
});
