import { Component, input, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OspSelectOption {
  value: string;
  label: string;
}

/**
 * Select dropdown reutilizable con flecha custom.
 *
 * Uso:
 *   <osp-select label="Elige opción" placeholder="Selecciona…" [options]="options()" />
 */
@Component({
  selector: 'osp-select',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OspSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="osp-select-wrapper" [class.osp-select-wrapper--error]="error()">
      @if (label()) {
        <label class="osp-select-label">{{ label() }}</label>
      }
      <div class="osp-select-container">
        <select
          [disabled]="disabled()"
          [value]="value()"
          (change)="onSelect($event)"
          (blur)="onTouched()"
          class="osp-select-field"
        >
          @if (placeholder()) {
            <option value="" disabled>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <!-- Custom arrow -->
        <svg
          class="osp-select-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      @if (error()) {
        <p class="osp-select-error">{{ error() }}</p>
      } @else if (hint()) {
        <p class="osp-select-hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .osp-select-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .osp-select-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--osp-info);
        transition: color var(--osp-duration-fast);
      }

      .osp-select-wrapper--error .osp-select-label {
        color: var(--osp-error);
      }

      .osp-select-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .osp-select-field {
        width: 100%;
        appearance: none;
        border-radius: 0.625rem;
        border: 1px solid var(--osp-border);
        background-color: var(--osp-bg-surface);
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        color: var(--osp-text);
        font-size: 0.935rem;
        font-family: inherit;
        cursor: pointer;
        transition:
          border-color var(--osp-duration-fast),
          box-shadow var(--osp-duration-fast),
          background-color var(--osp-duration-fast);
      }

      .osp-select-field:hover:not(:disabled) {
        border-color: var(--osp-border-hover);
      }

      .osp-select-field:focus {
        border-color: var(--osp-accent);
        outline: none;
        box-shadow: 0 0 0 3px var(--osp-ring);
      }

      .osp-select-field:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .osp-select-wrapper--error .osp-select-field {
        border-color: var(--osp-error);
      }

      .osp-select-arrow {
        position: absolute;
        right: 0.875rem;
        color: var(--osp-text-faint);
        pointer-events: none;
        transition: transform var(--osp-duration-fast) var(--osp-ease);
      }

      .osp-select-field:focus ~ .osp-select-arrow {
        color: var(--osp-accent);
        transform: rotate(180deg);
      }

      .osp-select-error {
        font-size: 0.78rem;
        color: var(--osp-error);
        margin: 0;
        animation: osp-fade-in var(--osp-duration-fast) var(--osp-ease);
      }

      .osp-select-hint {
        font-size: 0.78rem;
        color: var(--osp-text-faint);
        margin: 0;
      }
    `,
  ],
})
export class OspSelectComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<OspSelectOption[]>([]);
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly disabled = signal(false);

  readonly value = signal('');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (val: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
