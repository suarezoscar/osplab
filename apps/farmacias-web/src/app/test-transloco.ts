import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

/**
 * Traducciones en español inline para tests.
 * Solo se incluyen las claves que necesitan los componentes testados.
 */
const es = {
  search: {
    label: 'Dirección, ciudad o barrio',
    placeholder: 'Ciudad, barrio, dirección…',
    clear: 'Borrar búsqueda',
    suggestions_label: 'Sugerencias de dirección',
  },
  welcome: {
    title: '¿Dónde estás?',
    description:
      'Usa tu ubicación o escribe una dirección para encontrar la farmacia de guardia más cercana',
  },
  card: {
    closest: 'La más cercana',
    rank_1: 'La más cercana',
    rank_2: 'Segunda más cercana',
    rank_3: 'Tercera más cercana',
    address: 'Dirección',
    schedule: 'Horario de guardia',
    h24: 'Guardia 24 horas',
    directions: 'Cómo llegar',
    directions_to: 'Cómo llegar a {{name}} en {{app}}',
    call: 'Llamar a {{name}}: {{phone}}',
  },
};

/**
 * Opciones reutilizables de Transloco para tests de farmacias-web.
 * Carga las traducciones en español de forma síncrona.
 */
export const translocoTestingOptions: TranslocoTestingOptions = {
  translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
  preloadLangs: true,
  langs: { es },
};

/** Módulo listo para usar en `imports` de `render()`. */
export const TranslocoTestingConfig = TranslocoTestingModule.forRoot(translocoTestingOptions);
