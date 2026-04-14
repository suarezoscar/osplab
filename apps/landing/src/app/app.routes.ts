import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: 'events/create',
    loadComponent: () =>
      import('./pages/events/create/event-create.component').then((m) => m.EventCreateComponent),
  },
  {
    path: 'events/:slug',
    loadComponent: () =>
      import('./pages/events/view/event-view.component').then((m) => m.EventViewComponent),
  },
];
