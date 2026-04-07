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
      <img
        src="/assets/svg/osp-logo-horizontal.svg"
        alt="osplab.dev"
        width="90"
        height="18"
        class="shrink-0"
        [class.brightness-0]="theme() === 'light'"
        [class.opacity-40]="theme() === 'light'"
        [class.invert]="theme() === 'light'"
      />
    </a>
  `,
})
export class OspLabBadgeComponent {
  readonly theme = input<'light' | 'dark'>('light');

  linkClasses(): string {
    const base =
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 no-underline';

    return this.theme() === 'dark'
      ? `${base} hover:bg-white/5 opacity-70 hover:opacity-100`
      : `${base} hover:bg-gray-50 opacity-50 hover:opacity-80`;
  }
}
