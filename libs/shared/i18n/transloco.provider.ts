import { Provider, isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { OspTranslocoLoader } from './transloco-loader';

/** Idiomas soportados por OSPLab. */
export const OSP_AVAILABLE_LANGS = ['es', 'gl', 'ca', 'en'] as const;
export type OspLang = (typeof OSP_AVAILABLE_LANGS)[number];

/** Key de localStorage para persistir la preferencia de idioma. */
export const OSP_LANG_STORAGE_KEY = 'osp-lang';

/** Detecta el idioma inicial: localStorage → navigator → 'es'. */
export function detectInitialLang(): OspLang {
  try {
    const stored = localStorage.getItem(OSP_LANG_STORAGE_KEY) as OspLang | null;
    if (stored && OSP_AVAILABLE_LANGS.includes(stored)) return stored;
  } catch {
    // SSR / quota exceeded
  }

  const browserLang = navigator.language?.slice(0, 2) as OspLang;
  if (OSP_AVAILABLE_LANGS.includes(browserLang)) return browserLang;

  return 'es';
}

/**
 * Providers de Transloco reutilizables para todas las apps de OSPLab.
 *
 * Uso en app.config.ts:
 *   providers: [...provideOspTransloco()]
 */
export function provideOspTransloco(): Provider[] {
  return [
    provideTransloco({
      config: {
        availableLangs: [...OSP_AVAILABLE_LANGS],
        defaultLang: detectInitialLang(),
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: OspTranslocoLoader,
    }),
  ];
}
