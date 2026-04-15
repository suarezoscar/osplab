import { Route } from '@angular/router';

export const eventsRoutes: Route[] = [
  {
    path: 'create',
    loadComponent: () =>
      import('./events/create/event-create.component').then((m) => m.EventCreateComponent),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./events/view/event-view.component').then((m) => m.EventViewComponent),
  },
];
