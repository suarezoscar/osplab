import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const OG_IMAGE = 'https://osplab.dev/assets/images/og-image.png';

/** Servicio para actualizar meta tags dinámicamente (OG, Twitter). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);

  /** Actualiza las meta tags de la página con datos del evento. */
  setEventMeta(data: {
    title: string;
    location: string;
    date: string;
    slug: string;
    description?: string | null;
  }): void {
    const title = `${data.title} — OSPLab Events`;
    let description = `📅 ${data.date} · 📍 ${data.location}`;
    if (data.description) {
      description += ` — ${data.description}`;
    }
    const url = `https://osplab.dev/events/${data.slug}`;
    this.applyMeta(title, description, url);
  }

  /** Restaura las meta tags al estado por defecto. */
  resetMeta(): void {
    this.applyMeta(
      'OSPLab — Suite de herramientas open source',
      'Suite de herramientas open source. Sin publicidad, sin rastreo.',
      'https://osplab.dev',
    );
  }

  private applyMeta(title: string, description: string, url: string): void {
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: OG_IMAGE });
  }
}
