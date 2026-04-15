import { Component, input } from '@angular/core';
import { OspThemeToggleComponent } from '../theme-toggle/osp-theme-toggle.component';

/**
 * Header reutilizable para todos los proyectos de OSPLab.
 *
 * Muestra un banner con gradiente, icono (via content projection), título,
 * subtítulo y toggle de tema.
 *
 * Uso:
 *   <osp-header title="Farmacia de Guardia" subtitle="Encuentra la más cercana" from="#166534" to="#16a34a">
 *     <icon-pharmacy-cross [size]="28" />
 *   </osp-header>
 *
 *   <osp-header title="Crear evento" subtitle="Sin registro. Sin complicaciones." from="#92400e" to="#d97706">
 *     <osp-icon name="calendar" [size]="28" />
 *   </osp-header>
 */
@Component({
  selector: 'osp-header',
  standalone: true,
  imports: [OspThemeToggleComponent],
  template: `
    <header
      class="osph"
      [style.background]="'linear-gradient(135deg, ' + from() + ' 0%, ' + to() + ' 100%)'"
    >
      <!-- Decorative shimmer overlay -->
      <div class="osph-shimmer" aria-hidden="true"></div>

      <div class="osph-inner">
        <div class="osph-icon" aria-hidden="true">
          <ng-content />
        </div>
        <div class="osph-text">
          <h1 class="osph-title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="osph-subtitle">{{ subtitle() }}</p>
          }
        </div>
        <osp-theme-toggle />
      </div>

      <!-- Bottom decorative edge -->
      <div class="osph-edge" aria-hidden="true"></div>
    </header>
  `,
  styles: [
    `
      .osph {
        position: relative;
        color: #fff;
        overflow: hidden;
      }

      .osph-shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          120deg,
          transparent 30%,
          rgba(255, 255, 255, 0.06) 50%,
          transparent 70%
        );
        pointer-events: none;
      }

      .osph-inner {
        position: relative;
        max-width: 32rem;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 1.75rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .osph-icon {
        flex-shrink: 0;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.875rem;
      }

      .osph-text {
        flex: 1;
        min-width: 0;
      }

      .osph-title {
        font-size: 1.25rem;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.03em;
      }

      .osph-subtitle {
        font-size: 0.8rem;
        margin-top: 0.2rem;
        opacity: 0.8;
        font-weight: 400;
        letter-spacing: 0.01em;
      }

      .osph-edge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
      }

      /* Override theme toggle styles inside the header */
      :host ::ng-deep .osp-theme-toggle {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
      }

      :host ::ng-deep .osp-theme-toggle:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
      }
    `,
  ],
})
export class OspHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly from = input('#166534');
  readonly to = input('#16a34a');
}
