import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes del endpoint
// ──────────────────────────────────────────────────────────────────────────────

/**
 * URL base de la API REST del Colegio Oficial de Farmacéuticos de Ourense.
 * Documentación informal: wp-json/vcomm/v1/farmacias/guardia
 */
export const COFOURENSE_API_BASE = 'https://www.cofourense.es/wp-json/vcomm/v1/farmacias/guardia';

/** UUID estático requerido por la API (extraído del frontend de cofourense.es). */
export const COFOURENSE_UUID = 'a1164f33-ede5-4b10-9745-5f327b641426';

export const COFOURENSE_PROVINCE = 'Ourense';
export const COFOURENSE_PROVINCE_CODE = 'OR';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de la respuesta de la API
// ──────────────────────────────────────────────────────────────────────────────

interface CofContacto {
  direccion: string;
  provincia: string;
  municipio: string;
  localidad: string;
  codigo_postal: string;
  telefono: string;
  /** Formato: "[lat,lon]" como string — puede ser inválido */
  coordenadas: string;
  nota: string | null;
}

interface CofHorario {
  tipo: string;
  color: string;
  hora_apertura: string; // "HH:MM:SS"
  hora_cierre: string; // "HH:MM:SS"
  cierre_dia_siguiente: boolean;
}

interface CofFarmacia {
  fecha: string; // "YYYY-MM-DD"
  soe: string;
  nombre: string; // Nombre del farmacéutico titular
  nombre_fiscal: string; // Nombre fiscal de la farmacia (puede estar vacío)
  zona_guardia: string;
  contactos_profesionales: CofContacto[];
  horarios: CofHorario[];
}

export interface CofApiResponse {
  informacion: CofFarmacia[];
  metadatos: {
    paginacion: {
      totalElementos: string | number;
    };
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convierte "HH:MM:SS" → "HH:MM".
 * Retorna null si el formato no es reconocido.
 */
export function parseApiTime(raw: string): string | null {
  const match = raw?.trim().match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  return match ? match[1] : null;
}

/**
 * Parsea el string de coordenadas "[lat,lon]" de la API.
 * Retorna null si las coordenadas son inválidas o están fuera de rango.
 *
 * Ejemplo válido:   "[42.415296,-6.987211]"
 * Ejemplo inválido: "[4.2188410,-779.9320]"
 */
export function parseCoordinates(raw: string): { lat: number; lng: number } | null {
  try {
    // El string tiene formato "[lat,lon]"
    const match = raw?.trim().match(/^\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*]$/);
    if (!match) return null;

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    if (isNaN(lat) || isNaN(lng)) return null;

    // Validar rangos geográficos
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

/**
 * Determina el nombre a usar para la farmacia:
 * - Usa `nombre_fiscal` si no está vacío (ej: "FCIA. IGNACIO Y ESTELA...")
 * - Si está vacío, usa `nombre` (nombre del farmacéutico titular)
 */
export function resolvePharmacyName(nombreFiscal: string, nombre: string): string {
  const fiscal = nombreFiscal?.trim();
  return fiscal || nombre?.trim() || 'Farmacia desconocida';
}

/**
 * Devuelve el nombre del titular solo cuando existe un nombre_fiscal distinto.
 * Si no hay nombre_fiscal, el `name` ya ES el titular → ownerName sería redundante.
 *
 * Ejemplo: nombre_fiscal="FARMACIA GARCÍA", nombre="María García López"
 *   → ownerName = "María García López"
 * Ejemplo: nombre_fiscal="", nombre="Carlos Pérez Gómez"
 *   → ownerName = undefined  (el name ya muestra al titular)
 */
export function resolveOwnerName(nombreFiscal: string, nombre: string): string | undefined {
  const fiscal = nombreFiscal?.trim();
  const owner = nombre?.trim();
  return fiscal && owner ? owner : undefined;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convierte la respuesta JSON de la API de COF Ourense en un array de
 * `ScrapedDutySchedule`.
 *
 * - Si el JSON no tiene la estructura esperada → retorna [] (fail silently).
 * - Si una entrada individual es inválida → se omite esa entrada.
 * - Si las coordenadas están fuera de rango → se ignoran sin bloquear la entrada.
 *
 * @param data      - Respuesta JSON ya parseada de la API
 * @param date      - Fecha de referencia de la consulta
 * @param sourceUrl - URL de origen (para auditoría)
 */
export function parseCofourenseResponse(
  data: unknown,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    const response = data as CofApiResponse;
    const items = response?.informacion;

    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    // Fecha esperada en formato "YYYY-MM-DD" para validar cada item
    const pad = (n: number) => String(n).padStart(2, '0');
    const expectedDateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const schedules: ScrapedDutySchedule[] = [];

    for (const item of items) {
      try {
        // Validar datos mínimos
        if (!item.nombre) continue;

        // ── Validación de fecha ────────────────────────────────────────────
        // La API incluye la fecha real de guardia en cada item.
        // Solo procesamos items cuya fecha coincide con targetDate.
        if (item.fecha && item.fecha !== expectedDateStr) continue;

        const contacto: CofContacto | undefined = item.contactos_profesionales?.[0];
        if (!contacto?.direccion) continue;

        // Obtener horario de guardia (usar el primero disponible)
        const horario: CofHorario | undefined = item.horarios?.[0];
        if (!horario) continue;

        const startTime = parseApiTime(horario.hora_apertura);
        const endTime = parseApiTime(horario.hora_cierre);

        if (!startTime || !endTime) continue;

        // Coordenadas (opcionales — validadas)
        const coords = parseCoordinates(contacto.coordenadas);

        // Usar la fecha real del item para el DutySchedule
        const itemDate = item.fecha ? new Date(`${item.fecha}T00:00:00`) : date;

        const pharmacy = {
          name: resolvePharmacyName(item.nombre_fiscal, item.nombre),
          ownerName: resolveOwnerName(item.nombre_fiscal, item.nombre),
          address: contacto.direccion.trim(),
          phone: contacto.telefono?.replace(/\D/g, '').slice(0, 9) || undefined,
          cityName: (contacto.municipio || contacto.localidad || COFOURENSE_PROVINCE).trim(),
          provinceName: COFOURENSE_PROVINCE,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        };

        schedules.push({
          pharmacy,
          date: itemDate,
          startTime,
          endTime,
          sourceUrl,
        });
      } catch {
        // Fallo silencioso por entrada individual
      }
    }

    return schedules;
  } catch {
    return [];
  }
}

/**
 * Construye la URL de la API de COF Ourense para una fecha/hora determinada.
 *
 * @param date - Fecha para la que se quieren las farmacias de guardia
 */
export function buildCofourenseUrl(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const fechaStr = `${year}-${month}-${day}`;
  const horaStr = `${hours}:${minutes}:${seconds}`;

  const params = new URLSearchParams({
    estilo: 'completo',
    servicios: '',
    tipo: '',
    orden: 'salida_dia_siguiente DESC,soe ASC',
    uuid: COFOURENSE_UUID,
    zona: '',
    fecha_inicio: fechaStr,
    hora_inicio: horaStr,
    fecha_fin: fechaStr,
    hora_fin: horaStr,
    b: '',
    limit: '1000',
    filter: '',
  });

  return `${COFOURENSE_API_BASE}?${params.toString()}`;
}
