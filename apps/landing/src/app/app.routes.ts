import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: 'events',
    children: [
      {
        path: '**',
        // Redirige osplab.dev/events/* → events.osplab.dev/*
        canActivate: [
          () => {
            const sub = window.location.pathname.replace(/^\/events\/?/, '');
            window.location.href = `https://events.osplab.dev/${sub}`;
            return false;
          },
        ],
        component: HomeComponent, // placeholder, nunca se renderiza
      },
    ],
  },
];
