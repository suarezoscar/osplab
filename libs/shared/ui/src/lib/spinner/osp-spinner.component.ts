import { Component, input } from '@angular/core';

export type OspSpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner de carga.
 *
 * Uso:
 *   <osp-spinner />
 *   <osp-spinner size="lg" />
 */
@Component({
  selector: 'osp-spinner',
  standalone: true,
  template: `
    <svg [class]="'osp-spinner osp-spinner--' + size()" viewBox="0 0 24 24" fill="none">
      <circle
        class="osp-spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3.5"
      />
      <path
        class="osp-spinner-head"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .osp-spinner {
        animation: osp-spin 0.7s linear infinite;
        color: var(--osp-accent);
      }

      .osp-spinner--sm {
        width: 1rem;
        height: 1rem;
      }
      .osp-spinner--md {
        width: 1.5rem;
        height: 1.5rem;
      }
      .osp-spinner--lg {
        width: 2rem;
        height: 2rem;
      }

      .osp-spinner-track {
        opacity: 0.2;
      }
      .osp-spinner-head {
        opacity: 0.8;
      }

      @keyframes osp-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OspSpinnerComponent {
  readonly size = input<OspSpinnerSize>('md');
}
