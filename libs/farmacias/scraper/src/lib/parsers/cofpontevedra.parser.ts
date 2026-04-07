import type { ScrapedDutySchedule, ScrapedPharmacy } from '../interfaces/scraper.interfaces';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

export const COFPONTEVEDRA_MUNICIPIOS_URL = 'https://farmacias.cofpo.org/municipios.php';
export const COFPONTEVEDRA_GUARDIA_URL = 'https://farmacias.cofpo.org/farmaciasguardia.php';

export const COFPONTEVEDRA_PROVINCE = 'Pontevedra';
export const COFPONTEVEDRA_PROVINCE_CODE = 'PO';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de la API
// ──────────────────────────────────────────────────────────────────────────────

export interface CofpontevedraMunicipio {
  id: string;
  nombre: string;
  provincia: string;
  pais: string;
}

interface CofpontevedraItem {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  tipo: string; // "Diurno" | "Nocturno"
  longitud: string;
  latitud: string;
  idmunicipio: string;
  municipio: string;
  fecha: string; // "YYYY-MM-DD"
  observaciones: string; // "De 9:30 h. a 22 h."
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha al formato DD/MM/YYYY que espera la API.
 */
export function formatDateForCofpo(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Intenta extraer el horario de guardia del campo `observaciones`.
 * Ej: "De 9:30 h. a 22 h." → { start: "09:30", end: "22:00" }
 * Retorna null si no hay match.
 */
export function parseObservaciones(obs: string): { start: string; end: string } | null {
  if (!obs) return null;
  const match = obs.match(/de\s+(\d{1,2}(?::\d{2})?)\s*h[^a]*a\s+(\d{1,2}(?::\d{2})?)\s*h/i);
  if (!match) return null;

  const pad = (t: string) => {
    const parts = t.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1] ?? '00'}`;
  };
  return { start: pad(match[1]), end: pad(match[2]) };
}

/**
 * Determina el horario de guardia basándose en los tipos (Diurno/Nocturno)
 * y en el campo observaciones (si está disponible y parseable).
 */
export function resolveTimeRange(
  tipos: string[],
  observaciones: string[],
): { startTime: string; endTime: string } {
  // Intentar parsear el horario de las observaciones (primera no vacía)
  for (const obs of observaciones) {
    const parsed = parseObservaciones(obs);
    if (parsed) return { startTime: parsed.start, endTime: parsed.end };
  }

  // Fallback por tipo
  const hasDiurno = tipos.some((t) => t.toLowerCase() === 'diurno');
  const hasNocturno = tipos.some((t) => t.toLowerCase() === 'nocturno');

  if (hasDiurno && hasNocturno) return { startTime: '09:00', endTime: '09:00' }; // 24h
  if (hasNocturno) return { startTime: '22:00', endTime: '09:00' };
  return { startTime: '09:00', endTime: '22:00' }; // Diurno
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convierte el array de items de la API de COF Pontevedra en `ScrapedDutySchedule[]`.
 *
 * - Agrupa por farmacia (mismo `id`) para fusionar Diurno+Nocturno en un único turno.
 * - Retorna [] si la estructura no es válida (fail silently).
 *
 * No filtramos por fecha: la API ya devuelve solo las farmacias de guardia
 * para la `search_fecha` enviada. El campo `fecha` indica cuándo EMPIEZA la
 * guardia, que puede ser el día anterior en guardias nocturnas.
 *
 * @param data       - Respuesta JSON de la API (array)
 * @param targetDate - Fecha de referencia (fallback si un item no tiene `fecha`)
 * @param sourceUrl  - URL de origen (para auditoría)
 */
export function parseCofpontevedraItems(
  data: unknown,
  targetDate: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    if (!Array.isArray(data) || data.length === 0) return [];

    const items = data as CofpontevedraItem[];

    // Agrupar por id de farmacia (una farmacia puede tener Diurno + Nocturno)
    const byId = new Map<string, CofpontevedraItem[]>();
    for (const item of items) {
      if (!item.id || !item.nombre) continue;
      const list = byId.get(item.id) ?? [];
      list.push(item);
      byId.set(item.id, list);
    }

    const schedules: ScrapedDutySchedule[] = [];

    for (const entries of byId.values()) {
      try {
        const first = entries[0];

        const tipos = entries.map((e) => e.tipo);
        const observ = entries.map((e) => e.observaciones ?? '');
        const { startTime, endTime } = resolveTimeRange(tipos, observ);

        // Coordenadas
        const lat = parseFloat(first.latitud);
        const lng = parseFloat(first.longitud);
        const validCoords =
          !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

        const pharmacy: ScrapedPharmacy = {
          name: first.nombre.trim(),
          address: first.direccion.trim(),
          phone: first.telefono?.replace(/\D/g, '').slice(0, 9) || undefined,
          cityName: first.municipio.trim(),
          provinceName: COFPONTEVEDRA_PROVINCE,
          ...(validCoords ? { lat, lng } : {}),
        };

        // Usar la fecha real del item para el DutySchedule
        const itemDate = first.fecha ? new Date(`${first.fecha}T00:00:00Z`) : targetDate;

        schedules.push({ pharmacy, date: itemDate, startTime, endTime, sourceUrl });
      } catch {
        // Fail silently por entrada individual
      }
    }

    return schedules;
  } catch {
    return [];
  }
}
