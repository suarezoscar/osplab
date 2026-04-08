/**
 * Errores de conexión "duros" que indican que el servidor está caído o
 * bloqueando la IP. No tiene sentido reintentar ni seguir con más municipios
 * del mismo host.
 */
const HARD_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH']);

/**
 * Devuelve `true` si el error es un fallo de conexión definitivo
 * (servidor caído, IP bloqueada, DNS irresolvible…).
 *
 * Útil para:
 * - Saltar reintentos inmediatamente.
 * - Activar el circuit breaker del loop de municipios.
 */
export function isHardConnectionError(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException)?.code;
  if (code && HARD_ERROR_CODES.has(code)) return true;

  // Axios envuelve el error nativo en err.cause
  const cause = (err as { cause?: NodeJS.ErrnoException })?.cause;
  return !!cause?.code && HARD_ERROR_CODES.has(cause.code);
}
