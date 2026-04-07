/**
 * Utilidades de fecha/hora para la zona horaria de España (Europe/Madrid).
 *
 * Todas las APIs de colegios farmacéuticos gallegos esperan fechas y horas
 * en hora peninsular española. Este módulo garantiza que las fechas sean
 * correctas independientemente de la zona horaria del servidor (p.ej. UTC en CI).
 */

const SPAIN_TZ = 'Europe/Madrid';

// ─── Formateadores (se crean una sola vez) ───────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SPAIN_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: SPAIN_TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

// ─── Helpers internos ────────────────────────────────────────────────────────

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  const part = parts.find((p) => p.type === type);
  return part?.value ?? '';
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Devuelve la fecha actual en España como Date de medianoche UTC.
 *
 * Ejemplo: si en España son las 01:30 del 8 de abril (y en UTC las 23:30 del 7),
 * retorna `2026-04-08T00:00:00.000Z`.
 */
export function getSpainToday(): Date {
  const parts = dateFormatter.formatToParts(new Date());
  const y = getPart(parts, 'year');
  const m = getPart(parts, 'month');
  const d = getPart(parts, 'day');
  return new Date(`${y}-${m}-${d}T00:00:00Z`);
}

/**
 * Formatea una fecha en `YYYY-MM-DD` según la hora peninsular española.
 */
export function formatSpainDate(date: Date): string {
  const parts = dateFormatter.formatToParts(date);
  return `${getPart(parts, 'year')}-${getPart(parts, 'month')}-${getPart(parts, 'day')}`;
}

/**
 * Formatea una fecha en `DD/MM/YYYY` según la hora peninsular española.
 * Formato requerido por las APIs de COF Pontevedra y COFC.
 */
export function formatSpainDateDMY(date: Date): string {
  const parts = dateFormatter.formatToParts(date);
  return `${getPart(parts, 'day')}/${getPart(parts, 'month')}/${getPart(parts, 'year')}`;
}

/**
 * Formatea la hora en `HH:MM:SS` según la hora peninsular española.
 */
export function formatSpainTime(date: Date): string {
  const parts = timeFormatter.formatToParts(date);
  return `${getPart(parts, 'hour')}:${getPart(parts, 'minute')}:${getPart(parts, 'second')}`;
}
