import { Component } from '@angular/core';

/**
 * Badge "osplab.dev" reutilizable para los footers de todos los proyectos.
 *
 * Muestra un link sutil a la landing con el logo horizontal de la marca.
 * El SVG horizontal usa colores oscuros para texto, funciona sobre fondos claros.
 *
 * Uso:
 *   <osplab-badge />
 */
@Component({
  selector: 'osplab-badge',
  standalone: true,
  template: `
    <a
      href="https://osplab.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ir a osplab.dev — herramientas open source"
      class="inline-flex items-center rounded-full px-4 py-2 no-underline
              transition-all duration-300 ease-out
             hover:-translate-y-0.5"
    >
      <img
        src="/assets/svg/osp-logo-horizontal-light.svg"
        alt="osplab.dev"
        width="200"
        height="40"
        class="shrink-0"
      />
    </a>
  `,
})
export class OspLabBadgeComponent {}
