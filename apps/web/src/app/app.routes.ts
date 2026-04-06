import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'privacidad', component: PrivacyComponent },
];
