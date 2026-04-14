import { Component, input, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Textarea reutilizable con el mismo diseño que osp-input.
 *
 * Uso:
 *   <osp-textarea label="Descripción" placeholder="Detalles…" [rows]="4" />
 */
@Component({
  selector: 'osp-textarea',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OspTextareaComponent),
      multi: true,
    },
  ],
  template: `
    <div class="osp-textarea-wrapper" [class.osp-textarea-wrapper--error]="error()">
      @if (label()) {
        <label class="osp-textarea-label">{{ label() }}</label>
      }
      <textarea
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [rows]="rows()"
        [attr.maxlength]="maxlength()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="osp-textarea-field"
        [class.osp-textarea-field--no-resize]="!resizable()"
      ></textarea>
      @if (error()) {
        <p class="osp-textarea-error">{{ error() }}</p>
      } @else if (hint()) {
        <p class="osp-textarea-hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .osp-textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .osp-textarea-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--osp-info);
        transition: color var(--osp-duration-fast);
      }

      .osp-textarea-wrapper--error .osp-textarea-label {
        color: var(--osp-error);
      }

      .osp-textarea-field {
        width: 100%;
        border-radius: 0.625rem;
        border: 1px solid var(--osp-border);
        background-color: var(--osp-bg-surface);
        padding: 0.75rem 1rem;
        color: var(--osp-text);
        font-size: 0.935rem;
        font-family: inherit;
        line-height: 1.6;
        transition:
          border-color var(--osp-duration-fast),
          box-shadow var(--osp-duration-fast),
          background-color var(--osp-duration-fast);
      }

      .osp-textarea-field--no-resize {
        resize: none;
      }

      .osp-textarea-field::placeholder {
        color: var(--osp-text-faint);
      }

      .osp-textarea-field:hover:not(:disabled) {
        border-color: var(--osp-border-hover);
      }

      .osp-textarea-field:focus {
        border-color: var(--osp-accent);
        outline: none;
        box-shadow: 0 0 0 3px var(--osp-ring);
      }

      .osp-textarea-field:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .osp-textarea-wrapper--error .osp-textarea-field {
        border-color: var(--osp-error);
      }

      .osp-textarea-wrapper--error .osp-textarea-field:focus {
        box-shadow: 0 0 0 3px var(--osp-error-border);
      }

      .osp-textarea-error {
        font-size: 0.78rem;
        color: var(--osp-error);
        margin: 0;
        animation: osp-fade-in var(--osp-duration-fast) var(--osp-ease);
      }

      .osp-textarea-hint {
        font-size: 0.78rem;
        color: var(--osp-text-faint);
        margin: 0;
      }
    `,
  ],
})
export class OspTextareaComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly rows = input(3);
  readonly maxlength = input<number | null>(null);
  readonly resizable = input(false);
  readonly disabled = signal(false);

  readonly value = signal('');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (val: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
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
