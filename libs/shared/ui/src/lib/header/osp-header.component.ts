import { Component, input, signal, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { OspThemeToggleComponent } from '../theme-toggle/osp-theme-toggle.component';

/**
 * Header reutilizable para todos los proyectos de OSPLab.
 *
 * Sticky + frosted glass al hacer scroll (estilo iOS).
 * Soporta gradiente configurable, icono via content projection,
 * título, subtítulo y toggle de tema.
 *
 * Uso:
 *   <osp-header title="Farmacia de Guardia" subtitle="Encuentra la más cercana" from="#166534" to="#16a34a">
 *     <icon-pharmacy-cross [size]="28" />
 *   </osp-header>
 */
@Component({
  selector: 'osp-header',
  standalone: true,
  imports: [OspThemeToggleComponent],
  template: `
    <header class="osph" [class.osph--glass]="scrolled()">
      <!-- Gradient tint (fades on scroll to reveal glass) -->
      <div
        class="osph-tint"
        [style.background]="'linear-gradient(135deg, ' + from() + ' 0%, ' + to() + ' 100%)'"
      ></div>

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
    </header>
  `,
  styles: [
    `
      /* ── Host: sticky container ──────────────────────────────────── */
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 50;
      }

      /* ── Entry animation ─────────────────────────────────────────── */
      @keyframes osph-enter {
        from {
          opacity: 0;
          transform: translateY(-12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .osph {
        position: relative;
        color: #fff;
        overflow: hidden;
        animation: osph-enter 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
        transition:
          box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1),
          backdrop-filter 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── Gradient layer ──────────────────────────────────────────── */
      .osph-tint {
        position: absolute;
        inset: 0;
        z-index: 0;
        transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── Frosted glass state (on scroll) ─────────────────────────── */
      .osph--glass {
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05),
          0 4px 24px rgba(0, 0, 0, 0.1);
      }

      .osph--glass .osph-tint {
        opacity: 0.72;
      }

      /* ── Inner layout ────────────────────────────────────────────── */
      .osph-inner {
        position: relative;
        z-index: 1;
        max-width: 32rem;
        margin: 0 auto;
        padding: 1.375rem 1.25rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.875rem;
        transition: padding 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .osph--glass .osph-inner {
        padding: 0.75rem 1.25rem 0.875rem;
      }

      /* ── Icon (square, frosted) ──────────────────────────────────── */
      .osph-icon {
        flex-shrink: 0;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.14);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .osph--glass .osph-icon {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.625rem;
        background: rgba(255, 255, 255, 0.1);
      }

      /* ── Text ────────────────────────────────────────────────────── */
      .osph-text {
        flex: 1;
        min-width: 0;
      }

      .osph-title {
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.025em;
        transition: font-size 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .osph--glass .osph-title {
        font-size: 1.05rem;
      }

      .osph-subtitle {
        font-size: 0.78rem;
        margin-top: 0.15rem;
        opacity: 0.75;
        font-weight: 400;
        transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .osph--glass .osph-subtitle {
        font-size: 0.72rem;
        opacity: 0.6;
      }

      /* ── Theme toggle overrides ──────────────────────────────────── */
      :host ::ng-deep .osp-theme-toggle {
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.75);
        transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      :host ::ng-deep .osp-theme-toggle:hover {
        border-color: rgba(255, 255, 255, 0.25);
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
      }

      .osph--glass :host ::ng-deep .osp-theme-toggle,
      :host .osph--glass ::ng-deep .osp-theme-toggle {
        width: 2.25rem;
        height: 2.25rem;
      }
    `,
  ],
})
export class OspHeaderComponent implements OnInit, OnDestroy {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly from = input('#166534');
  readonly to = input('#16a34a');

  readonly scrolled = signal(false);

  private readonly zone = inject(NgZone);
  private scrollListener: (() => void) | null = null;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      const handler = () => {
        const isScrolled = window.scrollY > 16;
        if (isScrolled !== this.scrolled()) {
          this.scrolled.set(isScrolled);
        }
      };
      window.addEventListener('scroll', handler, { passive: true });
      this.scrollListener = () => window.removeEventListener('scroll', handler);
    });
  }

  ngOnDestroy(): void {
    this.scrollListener?.();
  }
}
