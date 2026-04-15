import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { OSP_AVAILABLE_LANGS, OSP_LANG_STORAGE_KEY, type OspLang } from '@osplab/shared-i18n';

/**
 * Selector de idioma compacto.
 * Alterna entre es / gl / ca con hot-swap (sin recarga).
 * Persiste la preferencia en localStorage.
 */
@Component({
  selector: 'osp-lang-switcher',
  standalone: true,
  template: `
    <div class="osp-lang-switcher">
      @for (lang of langs; track lang) {
        <button
          type="button"
          [class.active]="lang === activeLang"
          (click)="setLang(lang)"
          [attr.aria-label]="lang"
        >
          {{ lang.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: `
    .osp-lang-switcher {
      display: inline-flex;
      gap: 2px;
      border-radius: 8px;
      border: 1px solid var(--osp-border);
      overflow: hidden;
    }

    button {
      padding: 0.25rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: transparent;
      color: var(--osp-text-muted);
      border: none;
      cursor: pointer;
      transition: all 200ms ease;
    }

    button:hover {
      color: var(--osp-text);
      background: var(--osp-bg-hover);
    }

    button.active {
      color: var(--osp-accent);
      background: var(--osp-accent-muted);
    }
  `,
})
export class OspLangSwitcherComponent {
  private readonly transloco = inject(TranslocoService);

  readonly langs = [...OSP_AVAILABLE_LANGS];

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  setLang(lang: OspLang): void {
    this.transloco.setActiveLang(lang);
    try {
      localStorage.setItem(OSP_LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }
}
