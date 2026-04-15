import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

/**
 * Loader HTTP para Transloco.
 *
 * Carga el JSON de traducciones de `/i18n/<lang>.json` (assets de cada app).
 * Los ficheros compartidos (libs/shared/i18n/) se copian al build de cada app.
 */
@Injectable({ providedIn: 'root' })
export class OspTranslocoLoader implements TranslocoLoader {
  async getTranslation(lang: string): Promise<Translation> {
    const [shared, app] = await Promise.all([
      fetch(`/i18n/shared/${lang}.json`).then((r) => (r.ok ? r.json() : {})),
      fetch(`/i18n/${lang}.json`).then((r) => (r.ok ? r.json() : {})),
    ]);
    return { ...shared, ...app };
  }
}
