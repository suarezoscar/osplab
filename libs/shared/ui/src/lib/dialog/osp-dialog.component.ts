import { Component, output, model } from '@angular/core';

/**
 * Modal dialog con backdrop blur y animación slide-in.
 * Usa el elemento <dialog> nativo para accesibilidad.
 *
 * Uso:
 *   <osp-dialog [(open)]="showDialog">
 *     <h2>¿Estás seguro?</h2>
 *     <p>Esta acción no se puede deshacer.</p>
 *     <osp-button variant="danger" (click)="confirm()">Eliminar</osp-button>
 *   </osp-dialog>
 */
@Component({
  selector: 'osp-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="osp-dialog-backdrop" (click)="close()"></div>
      <div class="osp-dialog-container" role="dialog" aria-modal="true">
        <div class="osp-dialog-panel">
          <!-- Close button -->
          <button class="osp-dialog-close" (click)="close()" aria-label="Cerrar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .osp-dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 998;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        animation: osp-dialog-backdrop-in var(--osp-duration) ease-out;
      }

      .osp-dialog-container {
        position: fixed;
        inset: 0;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }

      .osp-dialog-panel {
        position: relative;
        max-width: 28rem;
        width: 100%;
        border-radius: 1rem;
        border: 1px solid var(--osp-border);
        background: var(--osp-bg-surface);
        padding: 1.75rem;
        box-shadow: var(--osp-shadow-lg);
        animation: osp-dialog-panel-in var(--osp-duration-slow) var(--osp-ease-bounce) both;
      }

      .osp-dialog-close {
        position: absolute;
        top: 0.875rem;
        right: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        border: none;
        background: transparent;
        color: var(--osp-text-faint);
        cursor: pointer;
        transition: all var(--osp-duration-fast);
      }

      .osp-dialog-close:hover {
        color: var(--osp-text);
        background: var(--osp-bg-hover);
      }

      @keyframes osp-dialog-backdrop-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes osp-dialog-panel-in {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class OspDialogComponent {
  /** Two-way binding: [(open)]="mySignal" */
  readonly open = model(false);
  readonly closed = output<void>();

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
