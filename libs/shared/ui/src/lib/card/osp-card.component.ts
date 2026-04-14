import { Component, input } from '@angular/core';

/**
 * Card container reutilizable con borde sutil, efecto shine opcional.
 *
 * Uso:
 *   <osp-card>Contenido</osp-card>
 *   <osp-card [shine]="true" accent="amber">Evento destacado</osp-card>
 */
@Component({
  selector: 'osp-card',
  standalone: true,
  template: `
    <div [class]="cardClass()">
      @if (shine()) {
        <div class="osp-card-shine"></div>
      }
      <!-- Top accent line -->
      <div class="osp-card-accent" [class.osp-card-accent--amber]="accent() === 'amber'"></div>
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .osp-card {
        position: relative;
        overflow: hidden;
        border-radius: 1rem;
        border: 1px solid var(--osp-border);
        background: var(--osp-bg-surface);
        padding: 1.5rem;
        box-shadow: var(--osp-shadow);
        transition:
          border-color var(--osp-duration),
          box-shadow var(--osp-duration),
          background-color var(--osp-duration);
        animation: osp-fade-in var(--osp-duration-slow) var(--osp-ease) both;
      }

      .osp-card:hover {
        border-color: var(--osp-border-hover);
      }

      .osp-card--amber {
        border-color: rgba(245, 158, 11, 0.15);
      }

      .osp-card--amber:hover {
        border-color: rgba(245, 158, 11, 0.3);
      }

      /* ── Accent line ─────────────────────────────────────────────── */
      .osp-card-accent {
        position: absolute;
        inset-inline: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, var(--osp-border-glow), transparent);
      }

      .osp-card-accent--amber {
        background: linear-gradient(to right, transparent, rgba(245, 158, 11, 0.4), transparent);
      }

      /* ── Shine effect ────────────────────────────────────────────── */
      .osp-card-shine {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 40%,
          rgba(255, 255, 255, 0.04) 45%,
          rgba(255, 255, 255, 0.08) 50%,
          rgba(255, 255, 255, 0.04) 55%,
          transparent 60%
        );
        translate: -100% 0;
        pointer-events: none;
        z-index: 1;
      }

      .osp-card:hover .osp-card-shine {
        animation: osp-shine 0.8s ease-out forwards;
      }

      @keyframes osp-fade-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes osp-shine {
        from {
          translate: -100% 0;
        }
        to {
          translate: 100% 0;
        }
      }
    `,
  ],
})
export class OspCardComponent {
  readonly shine = input(false);
  readonly accent = input<'default' | 'amber'>('default');

  cardClass(): string {
    const base = 'osp-card';
    return this.accent() === 'amber' ? `${base} osp-card--amber` : base;
  }
}
