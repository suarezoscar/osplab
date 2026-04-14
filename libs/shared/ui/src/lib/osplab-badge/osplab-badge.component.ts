import { Component, inject } from '@angular/core';
import { OspThemeService } from '../services/osp-theme.service';

/**
 * Badge "osplab.dev" reutilizable para los footers de todos los proyectos.
 * Adapta el logo según el tema actual (dark/light).
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
      class="osp-badge-link"
    >
      <img
        [src]="
          themeService.isDark()
            ? '/assets/svg/osp-logo-horizontal-dark.svg'
            : '/assets/svg/osp-logo-horizontal-light.svg'
        "
        alt="osplab.dev"
        width="200"
        height="40"
        class="osp-badge-logo"
      />
    </a>
  `,
  styles: [
    `
      .osp-badge-link {
        display: inline-flex;
        align-items: center;
        border-radius: 9999px;
        padding: 0.5rem 1rem;
        text-decoration: none;
        transition: all 300ms ease-out;
      }

      .osp-badge-link:hover {
        transform: translateY(-2px);
        opacity: 0.85;
      }

      .osp-badge-logo {
        flex-shrink: 0;
      }
    `,
  ],
})
export class OspLabBadgeComponent {
  readonly themeService = inject(OspThemeService);
}
