import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { APP_VERSION } from '../../../version';
import {
  OspThemeToggleComponent,
  OspThemeService,
  OspIconComponent,
  OspLabFooterComponent,
  OspLangSwitcherComponent,
} from '@osplab/shared-ui';
import { PROJECT_VERSIONS } from '@osplab/shared-interfaces';

interface Project {
  id: string;
  nameKey: string;
  descriptionKey: string;
  url: string;
  routerLink?: string;
  theme: 'green' | 'amber';
  status: 'live' | 'wip' | 'planned';
  tagKeys: string[];
  version?: string;
}

@Component({
  selector: 'app-home',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe,
    OspThemeToggleComponent,
    OspIconComponent,
    OspLabFooterComponent,
    OspLangSwitcherComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly appVersion = APP_VERSION;
  readonly themeService = inject(OspThemeService);
  private readonly t = inject(TranslocoService);

  readonly projects: Project[] = [
    {
      id: 'farmacias',
      nameKey: 'home.farmacias_name',
      descriptionKey: 'home.farmacias_desc',
      url: 'https://farmacias.osplab.dev',
      theme: 'green',
      status: 'live',
      tagKeys: ['tags.salud', 'tags.galicia', 'tags.madrid', 'tags.barcelona', 'tags.geo'],
      version: PROJECT_VERSIONS['farmacias-web'],
    },
    {
      id: 'events',
      nameKey: 'home.events_name',
      descriptionKey: 'home.events_desc',
      url: '/events/create',
      routerLink: '/events/create',
      theme: 'amber',
      status: 'live',
      tagKeys: ['tags.eventos', 'tags.whatsapp', 'tags.sin_registro'],
      version: PROJECT_VERSIONS['events'],
    },
  ];

  statusLabel(s: Project['status']): string {
    const key = {
      live: 'home.status_live',
      wip: 'home.status_wip',
      planned: 'home.status_planned',
    }[s];
    return this.t.translate(key);
  }
}
