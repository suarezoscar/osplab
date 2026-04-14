import { Component, input } from '@angular/core';

export type OspButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type OspButtonSize = 'sm' | 'md' | 'lg';

/**
 * Botón reutilizable con variantes, tamaños y estado loading.
 *
 * Uso:
 *   <osp-button>Crear evento</osp-button>
 *   <osp-button variant="secondary">Cancelar</osp-button>
 *   <osp-button variant="danger" [loading]="true">Eliminando…</osp-button>
 *   <osp-button size="lg" [disabled]="true">Deshabilitado</osp-button>
 */
@Component({
  selector: 'osp-button',
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()" [class]="buttonClass()">
      @if (loading()) {
        <svg class="osp-btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            class="osp-btn-spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="osp-btn-spinner-head"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      }
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-weight: 600;
        font-family: inherit;
        border: 1px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        transition:
          background-color var(--osp-duration-fast),
          border-color var(--osp-duration-fast),
          color var(--osp-duration-fast),
          box-shadow var(--osp-duration-fast),
          transform 100ms var(--osp-ease);
      }

      button:active:not(:disabled) {
        transform: scale(0.97);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* ── Sizes ──────────────────────────────────────────────────── */
      .osp-btn--sm {
        padding: 0.375rem 0.875rem;
        font-size: 0.82rem;
        border-radius: 0.5rem;
      }

      .osp-btn--md {
        padding: 0.625rem 1.25rem;
        font-size: 0.88rem;
        border-radius: 0.625rem;
      }

      .osp-btn--lg {
        padding: 0.875rem 1.75rem;
        font-size: 0.95rem;
        border-radius: 0.75rem;
      }

      /* ── Primary (amber) ────────────────────────────────────────── */
      .osp-btn--primary {
        background-color: var(--osp-accent);
        color: var(--osp-accent-text);
        box-shadow: 0 4px 14px var(--osp-accent-muted);
      }

      .osp-btn--primary:hover:not(:disabled) {
        background-color: var(--osp-accent-hover);
        box-shadow: 0 6px 20px var(--osp-accent-muted);
      }

      .osp-btn--primary:focus-visible {
        outline: 2px solid var(--osp-accent);
        outline-offset: 2px;
      }

      /* ── Secondary (outline) ────────────────────────────────────── */
      .osp-btn--secondary {
        background-color: transparent;
        border-color: var(--osp-border);
        color: var(--osp-text-muted);
      }

      .osp-btn--secondary:hover:not(:disabled) {
        border-color: var(--osp-border-hover);
        color: var(--osp-text-heading);
        background-color: var(--osp-bg-hover);
      }

      .osp-btn--secondary:focus-visible {
        outline: 2px solid var(--osp-accent);
        outline-offset: 2px;
      }

      /* ── Danger ──────────────────────────────────────────────────── */
      .osp-btn--danger {
        background-color: var(--osp-error-bg);
        border-color: var(--osp-error-border);
        color: var(--osp-error);
      }

      .osp-btn--danger:hover:not(:disabled) {
        background-color: var(--osp-error);
        color: white;
        border-color: var(--osp-error);
      }

      .osp-btn--danger:focus-visible {
        outline: 2px solid var(--osp-error);
        outline-offset: 2px;
      }

      /* ── Ghost ───────────────────────────────────────────────────── */
      .osp-btn--ghost {
        background-color: transparent;
        color: var(--osp-text-muted);
      }

      .osp-btn--ghost:hover:not(:disabled) {
        color: var(--osp-text-heading);
        background-color: var(--osp-bg-hover);
      }

      .osp-btn--ghost:focus-visible {
        outline: 2px solid var(--osp-accent);
        outline-offset: 2px;
      }

      /* ── Spinner ─────────────────────────────────────────────────── */
      .osp-btn-spinner {
        animation: osp-spin 0.75s linear infinite;
      }

      .osp-btn-spinner-track {
        opacity: 0.25;
      }

      .osp-btn-spinner-head {
        opacity: 0.75;
      }

      @keyframes osp-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OspButtonComponent {
  readonly variant = input<OspButtonVariant>('primary');
  readonly size = input<OspButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);

  buttonClass(): string {
    return `osp-btn--${this.variant()} osp-btn--${this.size()}`;
  }
}
