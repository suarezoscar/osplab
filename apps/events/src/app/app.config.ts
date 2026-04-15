import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { EVENTS_APP_VERSION } from '@osplab/events-data-access';
import { APP_VERSION } from '../version';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: EVENTS_APP_VERSION, useValue: APP_VERSION },
  ],
};
