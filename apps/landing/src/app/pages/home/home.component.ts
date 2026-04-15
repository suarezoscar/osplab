import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION } from '../../../version';
import {
  OspThemeToggleComponent,
  OspThemeService,
  OspIconComponent,
  OspLabFooterComponent,
} from '@osplab/shared-ui';
import { PROJECT_VERSIONS } from '@osplab/shared-interfaces';

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  routerLink?: string;
  theme: 'green' | 'amber';
  status: 'live' | 'wip' | 'planned';
  tags: string[];
  version?: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, OspThemeToggleComponent, OspIconComponent, OspLabFooterComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly appVersion = APP_VERSION;
  readonly themeService = inject(OspThemeService);

  readonly projects: Project[] = [
    {
      id: 'farmacias',
      name: 'Farmacias de Guardia',
      description:
        'Encuentra las farmacias de guardia más cercanas a tu ubicación en tiempo real. Disponible en Galicia, Madrid y Barcelona — más provincias próximamente.',
      url: 'https://farmacias.osplab.dev',
      theme: 'green',
      status: 'live',
      tags: ['Salud', 'Galicia', 'Madrid', 'Barcelona', 'Geolocalización'],
      version: PROJECT_VERSIONS['farmacias-web'],
    },
    {
      id: 'events',
      name: 'Eventos',
      description:
        'Crea un evento, comparte el enlace en WhatsApp y deja que la gente se apunte. Sin registro, sin complicaciones.',
      url: '/events/create',
      routerLink: '/events/create',
      theme: 'amber',
      status: 'live',
      tags: ['Eventos', 'WhatsApp', 'Sin registro'],
      version: PROJECT_VERSIONS['events'],
    },
  ];

  statusLabel(s: Project['status']): string {
    return { live: 'Activo', wip: 'En desarrollo', planned: 'Próximamente' }[s];
  }
}
