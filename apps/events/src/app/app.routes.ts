import { Route } from '@angular/router';
import { eventsRoutes } from '@osplab/events';

export const appRoutes: Route[] = [
  // Redirigir raíz a /create
  { path: '', pathMatch: 'full', redirectTo: 'create' },
  // Rutas de events como root (create, :slug)
  ...eventsRoutes,
];
