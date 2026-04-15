/**
 * Versiones centralizadas de todos los proyectos de OSPLab.
 *
 * Fuente única de verdad — el script bump-version.ts actualiza solo este archivo.
 * Cada app re-exporta su versión desde aquí.
 */
export const PROJECT_VERSIONS = {
  landing: '1.2.0',
  'farmacias-web': '1.2.0',
  events: '1.0.0',
} as const;
