import { Component } from '@angular/core';

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  theme: 'green' | 'blue';
  status: 'live' | 'wip' | 'planned';
  tags: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly projects: Project[] = [
    {
      id: 'farmacias',
      name: 'Farmacias de Guardia',
      description:
        'Consulta las farmacias de guardia más cercanas a tu ubicación en Galicia, en tiempo real desde los colegios oficiales de farmacéuticos.',
      url: 'https://farmacias.osplab.dev',
      theme: 'green',
      status: 'live',
      tags: ['Salud', 'Galicia', 'Geolocalización'],
    },
  ];

  statusLabel(s: Project['status']): string {
    return { live: 'Activo', wip: 'En desarrollo', planned: 'Próximamente' }[s];
  }

  statusClass(s: Project['status']): string {
    return {
      live: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
      wip: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
      planned: 'bg-blue-950/60 text-blue-400 border border-blue-800/50',
    }[s];
  }

  cardClass(theme: Project['theme']): string {
    return {
      green: 'border-[#0e3020] bg-[#060f09] hover:border-[#1e6638] hover:bg-[#071410]',
      blue: 'border-[#132d4e] bg-[#07162a] hover:border-[#1f4f82] hover:bg-[#091d38]',
    }[theme];
  }

  iconBoxClass(theme: Project['theme']): string {
    return {
      green: 'bg-[#0b2416] text-[#4ade80]',
      blue: 'bg-[#0c2040] text-[#60a5fa]',
    }[theme];
  }

  arrowClass(theme: Project['theme']): string {
    return {
      green: 'text-[#1a4d2a] group-hover:text-[#4ade80]',
      blue: 'text-[#1f4572] group-hover:text-[#3b82f6]',
    }[theme];
  }
}
