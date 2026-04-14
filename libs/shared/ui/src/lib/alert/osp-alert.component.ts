import { Component, input } from '@angular/core';
import { OspIconComponent } from '../icon/osp-icon.component';

export type OspAlertType = 'error' | 'warning' | 'success' | 'info';

/**
 * Banner de alerta/notificación con iconos y colores semánticos.
 *
 * Uso:
 *   <osp-alert type="error">Algo salió mal.</osp-alert>
 *   <osp-alert type="success">¡Evento creado!</osp-alert>
 */
@Component({
  selector: 'osp-alert',
  standalone: true,
  imports: [OspIconComponent],
  template: `
    <div [class]="'osp-alert osp-alert--' + type()" role="alert">
      <osp-icon [name]="iconMap[type()]" [size]="18" class="osp-alert-icon" />
      <div class="osp-alert-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .osp-alert {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid;
        font-size: 0.88rem;
        line-height: 1.5;
        animation: osp-alert-enter var(--osp-duration-slow) var(--osp-ease) both;
      }

      .osp-alert-icon {
        flex-shrink: 0;
        margin-top: 0.1rem;
      }

      .osp-alert-content {
        flex: 1;
        min-width: 0;
      }

      /* ── Variants ────────────────────────────────────────────────── */
      .osp-alert--error {
        background-color: var(--osp-error-bg);
        border-color: var(--osp-error-border);
        color: var(--osp-error);
      }

      .osp-alert--warning {
        background-color: var(--osp-warning-bg);
        border-color: var(--osp-warning-border);
        color: var(--osp-warning);
      }

      .osp-alert--success {
        background-color: var(--osp-success-bg);
        border-color: var(--osp-success-border);
        color: var(--osp-success);
      }

      .osp-alert--info {
        background-color: var(--osp-info-bg);
        border-color: var(--osp-info-border);
        color: var(--osp-info);
      }

      @keyframes osp-alert-enter {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class OspAlertComponent {
  readonly type = input<OspAlertType>('info');

  readonly iconMap: Record<OspAlertType, string> = {
    error: 'x-circle',
    warning: 'warning-circle',
    success: 'check-circle',
    info: 'info',
  };
}
