import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes del endpoint
// ──────────────────────────────────────────────────────────────────────────────

/**
 * URL de la API REST del Colegio Oficial de Farmacéuticos de Madrid (COFM).
 * Devuelve un JSON con todas las farmacias de la Comunidad de Madrid,
 * incluyendo estado de apertura, guardia y horarios.
 */
export const COFM_API_URL = 'https://www.cofm.es/rest/farmacias/es';

export const COFM_PROVINCE = 'Madrid';
export const COFM_PROVINCE_CODE = 'M';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de la respuesta de la API
// ──────────────────────────────────────────────────────────────────────────────

export interface CofmPharmacy {
  identificador: string;
  direccion: string;
  poblacion: string;
  latitud: string;
  longitud: string;
  telefono: string;
  codigoPostal: string;
  /** Horario compacto del día: "09:15-21:15" o "08:30-14:00,17:00-20:30" */
  horarioHoy: string;
  /** Horario legible: "09:15–21:15" o "08:30–14:00 · 17:00–20:30" */
  horarioDesc: string;
  abierta: boolean;
  guardia: boolean;
  servicio24h: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parsea las coordenadas de la API de COFM.
 * Valida que sean números dentro de rangos geográficos válidos.
 */
export function parseCofmCoordinates(
  latStr: string,
  lngStr: string,
): { lat: number; lng: number } | null {
  try {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

/**
 * Parsea el campo `horarioHoy` de la API de COFM y extrae los tramos horarios.
 *
 * Formatos soportados:
 * - "09:15-21:15"                   → [{ start: "09:15", end: "21:15" }]
 * - "08:30-14:00,17:00-20:30"      → [{ start: "08:30", end: "14:00" }, { start: "17:00", end: "20:30" }]
 * - "00:00-23:59"                   → [{ start: "00:00", end: "23:59" }] (24h)
 *
 * Retorna [] si el formato no es reconocido.
 */
export function parseCofmSchedule(horarioHoy: string): { start: string; end: string }[] {
  if (!horarioHoy?.trim()) return [];

  const TIME_RANGE = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/;
  const segments = horarioHoy.split(',');
  const result: { start: string; end: string }[] = [];

  for (const segment of segments) {
    const match = segment.trim().match(TIME_RANGE);
    if (!match) return []; // formato inesperado → descartamos todo
    result.push({ start: match[1], end: match[2] });
  }

  return result;
}

/**
 * Genera un nombre de farmacia a partir de la dirección y población,
 * ya que la API de COFM no proporciona nombres comerciales.
 *
 * Ejemplo: "Farmacia PZ DOS DE MAYO, 6 - MADRID"
 */
export function buildCofmPharmacyName(direccion: string, poblacion: string): string {
  const addr = direccion?.trim();
  const city = poblacion?.trim();
  if (!addr) return 'Farmacia desconocida';
  return city ? `Farmacia ${addr} - ${city}` : `Farmacia ${addr}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convierte la respuesta JSON de la API de COFM en un array de
 * `ScrapedDutySchedule`.
 *
 * - Solo se incluyen farmacias con `guardia: true` o `servicio24h: true`.
 * - Si el JSON no tiene la estructura esperada → retorna [] (fail silently).
 * - Si una entrada individual es inválida → se omite esa entrada.
 *
 * @param data      - Respuesta JSON ya parseada de la API (array de CofmPharmacy)
 * @param date      - Fecha de referencia para los turnos
 * @param sourceUrl - URL de origen (para auditoría)
 */
export function parseCofmResponse(
  data: unknown,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const items = data as CofmPharmacy[];
    const schedules: ScrapedDutySchedule[] = [];

    for (const item of items) {
      try {
        // Solo incluimos farmacias de guardia o con servicio 24h
        if (!item.guardia && !item.servicio24h) continue;

        // Validar datos mínimos
        if (!item.direccion?.trim()) continue;

        // Parsear horario
        const timeSlots = parseCofmSchedule(item.horarioHoy);
        if (timeSlots.length === 0) continue;

        // Coordenadas (opcionales — validadas)
        const coords = parseCofmCoordinates(item.latitud, item.longitud);

        const pharmacy = {
          name: buildCofmPharmacyName(item.direccion, item.poblacion),
          address: item.direccion.trim(),
          phone: item.telefono?.replace(/\D/g, '').slice(0, 9) || undefined,
          cityName: (item.poblacion || COFM_PROVINCE).trim(),
          provinceName: COFM_PROVINCE,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        };

        // Crear un schedule por cada tramo horario
        for (const slot of timeSlots) {
          schedules.push({
            pharmacy,
            date,
            startTime: slot.start,
            endTime: slot.end,
            sourceUrl,
          });
        }
      } catch {
        // Fallo silencioso por entrada individual
      }
    }

    return schedules;
  } catch {
    return [];
  }
}
