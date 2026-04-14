import { Component, input, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Input text reutilizable con floating label, focus ring y estados.
 *
 * Uso:
 *   <osp-input label="Email" placeholder="tu@email.com" />
 *   <osp-input label="Nombre" [error]="'Campo obligatorio'" />
 *   <osp-input type="password" label="Contraseña" hint="Mínimo 6 caracteres" />
 */
@Component({
  selector: 'osp-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OspInputComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="osp-input-wrapper"
      [class.osp-input-wrapper--error]="error()"
      [class.osp-input-wrapper--disabled]="disabled()"
    >
      @if (label()) {
        <label class="osp-input-label">{{ label() }}</label>
      }
      <div class="osp-input-container">
        @if (icon()) {
          <span class="osp-input-icon">{{ icon() }}</span>
        }
        <input
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.maxlength]="maxlength()"
          [min]="min()"
          [autocomplete]="autocomplete()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="osp-input-field"
          [class.osp-input-field--with-icon]="!!icon()"
        />
      </div>
      @if (error()) {
        <p class="osp-input-error">{{ error() }}</p>
      } @else if (hint()) {
        <p class="osp-input-hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .osp-input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .osp-input-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--osp-info);
        transition: color var(--osp-duration-fast);
      }

      .osp-input-wrapper--error .osp-input-label {
        color: var(--osp-error);
      }

      .osp-input-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .osp-input-icon {
        position: absolute;
        left: 0.875rem;
        font-size: 1.1rem;
        pointer-events: none;
        z-index: 1;
      }

      .osp-input-field {
        width: 100%;
        border-radius: 0.625rem;
        border: 1px solid var(--osp-border);
        background-color: var(--osp-bg-surface);
        padding: 0.75rem 1rem;
        color: var(--osp-text);
        font-size: 0.935rem;
        transition:
          border-color var(--osp-duration-fast),
          box-shadow var(--osp-duration-fast),
          background-color var(--osp-duration-fast);
      }

      .osp-input-field--with-icon {
        padding-left: 2.75rem;
      }

      .osp-input-field::placeholder {
        color: var(--osp-text-faint);
      }

      .osp-input-field:hover:not(:disabled) {
        border-color: var(--osp-border-hover);
      }

      .osp-input-field:focus {
        border-color: var(--osp-accent);
        outline: none;
        box-shadow: 0 0 0 3px var(--osp-ring);
      }

      .osp-input-field:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .osp-input-wrapper--error .osp-input-field {
        border-color: var(--osp-error);
      }

      .osp-input-wrapper--error .osp-input-field:focus {
        box-shadow: 0 0 0 3px var(--osp-error-border);
      }

      .osp-input-error {
        font-size: 0.78rem;
        color: var(--osp-error);
        margin: 0;
        animation: osp-fade-in var(--osp-duration-fast) var(--osp-ease);
      }

      .osp-input-hint {
        font-size: 0.78rem;
        color: var(--osp-text-faint);
        margin: 0;
      }
    `,
  ],
})
export class OspInputComponent implements ControlValueAccessor {
  // Inputs
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly icon = input('');
  readonly maxlength = input<number | null>(null);
  readonly min = input('');
  readonly autocomplete = input('off');
  readonly disabled = signal(false);

  // Internal value
  readonly value = signal('');

  // CVA callbacks
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (val: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────
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
