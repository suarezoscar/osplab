import { Component, input } from '@angular/core';

/**
 * Badge "osplab.dev" reutilizable para los footers de todos los proyectos.
 *
 * Muestra un link sutil a la landing con un pequeño icono de marca.
 * Se adapta a fondos claros (por defecto) y oscuros (`theme="dark"`).
 *
 * Uso:
 *   <osplab-badge />                   — fondo claro (farmacias, etc.)
 *   <osplab-badge theme="dark" />      — fondo oscuro (landing)
 */
@Component({
  selector: 'osplab-badge',
  standalone: true,
  template: `
    <a
      href="https://osplab.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ir a osplab.dev — herramientas open source para la ciudadanía"
      [class]="linkClasses()"
    >
      <!-- OSP mark — 3 puntos superpuestos que evocan la O del logo -->
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        class="shrink-0"
      >
        <circle cx="8" cy="13" r="5.5" [attr.fill]="dotColors()[0]" opacity="0.85" />
        <circle cx="15" cy="10" r="5.5" [attr.fill]="dotColors()[1]" opacity="0.8" />
        <circle cx="12" cy="16" r="4" [attr.fill]="dotColors()[2]" opacity="0.9" />
      </svg>
      <span class="font-medium">osplab</span>
      <span [class]="tldClasses()">.dev</span>
    </a>
  `,
})
export class OspLabBadgeComponent {
  readonly theme = input<'light' | 'dark'>('light');

  linkClasses(): string {
    const base =
      'inline-flex items-center gap-1.5 text-sm tracking-tight rounded-full px-3 py-1.5 transition-all duration-200 no-underline';

    return this.theme() === 'dark'
      ? `${base} text-[#7aaec8] hover:text-white hover:bg-white/5`
      : `${base} text-gray-400 hover:text-gray-600 hover:bg-gray-50`;
  }

  tldClasses(): string {
    return this.theme() === 'dark' ? 'text-[#4d8aaa] font-normal' : 'text-gray-300 font-normal';
  }

  dotColors(): [string, string, string] {
    return this.theme() === 'dark'
      ? ['#3375A2', '#368F8B', '#F9B06C']
      : ['#3375A2', '#368F8B', '#F9B06C'];
  }
}
