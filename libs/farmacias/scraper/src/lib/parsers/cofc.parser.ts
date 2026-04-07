import type { ScrapedDutySchedule, ScrapedPharmacy } from '../interfaces/scraper.interfaces';
import { formatSpainDateDMY } from '../utils/spain-date.util';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

export const COFC_API_URL = 'https://www.cofc.es/farmacia/index';
export const COFC_PROVINCE = 'A Coruña';
export const COFC_PROVINCE_CODE = 'CO';

/**
 * Municipios de la provincia de A Coruña con sus IDs del sistema COFC.
 * Extraídos del selector <select id="IdPoblacionFiltro"> de https://www.cofc.es/farmacia/index
 */
export const COFC_MUNICIPIOS: ReadonlyArray<{ id: number; nombre: string }> = [
  { id: 2136, nombre: 'A Baña' },
  { id: 2154, nombre: 'A Capela' },
  { id: 2137, nombre: 'A Coruña' },
  { id: 2178, nombre: 'A Laracha' },
  { id: 2205, nombre: 'A Pobra do Caramiñal' },
  { id: 2138, nombre: 'Abegondo' },
  { id: 2139, nombre: 'Ames' },
  { id: 2140, nombre: 'Aranga' },
  { id: 2141, nombre: 'Ares' },
  { id: 2142, nombre: 'Arteixo' },
  { id: 2143, nombre: 'Arzúa' },
  { id: 2208, nombre: 'As Pontes' },
  { id: 2219, nombre: 'As Somozas' },
  { id: 2144, nombre: 'Bergondo' },
  { id: 2145, nombre: 'Betanzos' },
  { id: 2146, nombre: 'Boimorto' },
  { id: 2147, nombre: 'Boiro' },
  { id: 2148, nombre: 'Boqueixón' },
  { id: 2149, nombre: 'Brión' },
  { id: 2150, nombre: 'Cabana de Bergantiños' },
  { id: 2151, nombre: 'Cabanas' },
  { id: 2152, nombre: 'Camariñas' },
  { id: 2153, nombre: 'Cambre' },
  { id: 2155, nombre: 'Carballo' },
  { id: 2156, nombre: 'Cariño' },
  { id: 2157, nombre: 'Carnota' },
  { id: 2158, nombre: 'Carral' },
  { id: 2159, nombre: 'Cedeira' },
  { id: 2160, nombre: 'Cee' },
  { id: 2161, nombre: 'Cerceda' },
  { id: 2162, nombre: 'Cerdido' },
  { id: 2164, nombre: 'Coirós' },
  { id: 2165, nombre: 'Corcubión' },
  { id: 2166, nombre: 'Coristanco' },
  { id: 2168, nombre: 'Culleredo' },
  { id: 2169, nombre: 'Curtis' },
  { id: 2171, nombre: 'Dodro' },
  { id: 2172, nombre: 'Dumbría' },
  { id: 2173, nombre: 'Fene' },
  { id: 2174, nombre: 'Ferrol' },
  { id: 2175, nombre: 'Fisterra' },
  { id: 2176, nombre: 'Frades' },
  { id: 2177, nombre: 'Irixoa' },
  { id: 2179, nombre: 'Laxe' },
  { id: 2180, nombre: 'Lousame' },
  { id: 2181, nombre: 'Malpica de Bergantiños' },
  { id: 2182, nombre: 'Mañón' },
  { id: 2183, nombre: 'Mazaricos' },
  { id: 2184, nombre: 'Melide' },
  { id: 2185, nombre: 'Mesía' },
  { id: 2186, nombre: 'Miño' },
  { id: 2187, nombre: 'Moeche' },
  { id: 2188, nombre: 'Monfero' },
  { id: 2189, nombre: 'Mugardos' },
  { id: 2190, nombre: 'Muros' },
  { id: 2191, nombre: 'Muxía' },
  { id: 2192, nombre: 'Narón' },
  { id: 2193, nombre: 'Neda' },
  { id: 2194, nombre: 'Negreira' },
  { id: 2195, nombre: 'Noia' },
  { id: 2204, nombre: 'O Pino' },
  { id: 2196, nombre: 'Oleiros' },
  { id: 2197, nombre: 'Ordes' },
  { id: 2198, nombre: 'Oroso' },
  { id: 2199, nombre: 'Ortigueira' },
  { id: 2200, nombre: 'Outes' },
  { id: 2201, nombre: 'Oza-Cesuras' },
  { id: 2202, nombre: 'Paderne' },
  { id: 2203, nombre: 'Padrón' },
  { id: 2206, nombre: 'Ponteceso' },
  { id: 2207, nombre: 'Pontedeume' },
  { id: 2209, nombre: 'Porto do Son' },
  { id: 2210, nombre: 'Rianxo' },
  { id: 2211, nombre: 'Ribeira' },
  { id: 2212, nombre: 'Rois' },
  { id: 2213, nombre: 'Sada' },
  { id: 2214, nombre: 'San Sadurniño' },
  { id: 2215, nombre: 'Santa Comba' },
  { id: 2216, nombre: 'Santiago de Compostela' },
  { id: 2217, nombre: 'Santiso' },
  { id: 2218, nombre: 'Sobrado' },
  { id: 2220, nombre: 'Teo' },
  { id: 2221, nombre: 'Toques' },
  { id: 2222, nombre: 'Tordoia' },
  { id: 2223, nombre: 'Touro' },
  { id: 2224, nombre: 'Trazo' },
  { id: 2225, nombre: 'Val do Dubra' },
  { id: 2226, nombre: 'Valdoviño' },
  { id: 2227, nombre: 'Vedra' },
  { id: 2228, nombre: 'Vilarmaior' },
  { id: 2229, nombre: 'Vilasantar' },
  { id: 2230, nombre: 'Vimianzo' },
  { id: 2231, nombre: 'Zas' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de la API
// ──────────────────────────────────────────────────────────────────────────────

/** @deprecated Usar CofcListadoItem. Mantenido por compatibilidad con tests existentes. */
export interface CofcMapItem {
  lat: number;
  lng: number;
  titulo: string;
  id: number;
}

/** Estructura real de cada elemento en listadoTodas de la API COFC. */
export interface CofcListadoItem {
  idFarmacia: number;
  nombre: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  idPoblacion: number;
  nombrePoblacion: string;
  horario: string;
  idGuardiaTipoTurno: number;
  nombreGuardiaTipoTurno: string;
  abierta: boolean;
  codigoSanidad: string | null;
}

export interface CofcApiResponse {
  formulario: string;
  listadoTodas: CofcListadoItem[];
  nombrePoblacion: string;
  esBusquedaGuardias: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha al formato DD/MM/YYYY que espera la API de COFC.
 */
export function formatDateForCofc(date: Date): string {
  return formatSpainDateDMY(date);
}

/**
 * Parsea el texto del horario.
 *
 * Formatos soportados:
 *   "09:30 - 22:00"              → { startTime: "09:30", endTime: "22:00" }  (API real)
 *   "00:00 - 09:30 (día posterior)" → { startTime: "00:00", endTime: "09:30" }
 *   "De 09:30 h. a 22:00 h."    → { startTime: "09:30", endTime: "22:00" }  (formato antiguo)
 *   "Guardia diurna"             → { startTime: "09:00", endTime: "22:00" }
 *   "Guardia nocturna"           → { startTime: "22:00", endTime: "09:00" }
 *   "24 horas" / "Guardia 24h"  → { startTime: "09:00", endTime: "09:00" }
 */
export function parseCofcSchedule(text: string): { startTime: string; endTime: string } {
  if (!text) return { startTime: '09:00', endTime: '22:00' };

  const lower = text.toLowerCase();

  // 24h (verificar antes del regex de horas para evitar falsos positivos con "24")
  if (lower.includes('24')) return { startTime: '09:00', endTime: '09:00' };

  // Formato real API: "HH:MM - HH:MM" (con posible sufijo como "(día posterior)")
  const dashMatch = lower.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  if (dashMatch) {
    return { startTime: dashMatch[1], endTime: dashMatch[2] };
  }

  // Formato antiguo: "De HH[:MM] h. a HH[:MM] h."
  const deMatch = lower.match(/de\s+(\d{1,2}(?::\d{2})?)\s*h[^a]*a\s+(\d{1,2}(?::\d{2})?)\s*h/i);
  if (deMatch) {
    const pad = (t: string) => {
      const parts = t.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1] ?? '00'}`;
    };
    return { startTime: pad(deMatch[1]), endTime: pad(deMatch[2]) };
  }

  if (lower.includes('nocturna') || lower.includes('nocturno')) {
    return { startTime: '22:00', endTime: '09:00' };
  }

  // Diurna (default)
  return { startTime: '09:00', endTime: '22:00' };
}

/**
 * Construye un mapa de nombre normalizado → coordenadas a partir de `listadoTodas`.
 * @deprecated Mantenido por compatibilidad. La lógica de parseo usa listadoTodas directamente.
 */
export function buildCofcCoordsMap(
  listadoTodas: CofcMapItem[],
): Map<string, { lat: number; lng: number }> {
  const map = new Map<string, { lat: number; lng: number }>();
  for (const item of listadoTodas ?? []) {
    if (!item?.titulo || item.lat == null || item.lng == null) continue;
    map.set(item.titulo.trim().toUpperCase(), { lat: item.lat, lng: item.lng });
  }
  return map;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parsea la respuesta JSON de la API del COF de A Coruña (COFC).
 *
 * Usa directamente el array `listadoTodas` que contiene todos los datos
 * estructurados (nombre, dirección, teléfono, coordenadas, horario).
 *
 * Falla silenciosamente: si la respuesta no tiene la estructura esperada → retorna [].
 *
 * @param data      - Respuesta JSON ya parseada de la API
 * @param municipio - Nombre del municipio consultado (fallback para cityName)
 * @param date      - Fecha de guardia
 * @param sourceUrl - URL de origen (para auditoría)
 */
export function parseCofcResponse(
  data: unknown,
  municipio: string,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    const response = data as CofcApiResponse;
    const items = response?.listadoTodas;

    if (!Array.isArray(items) || items.length === 0) return [];

    return items
      .filter((item): item is CofcListadoItem => !!item?.nombre)
      .map((item) => {
        const { startTime, endTime } = parseCofcSchedule(item.horario ?? '');

        const lat = item.latitud;
        const lng = item.longitud;
        const validCoords =
          lat != null &&
          lng != null &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180;

        const pharmacy: ScrapedPharmacy = {
          name: item.nombre,
          address: item.direccion,
          phone: item.telefono?.replace(/\D/g, '').slice(0, 9) || undefined,
          cityName: item.nombrePoblacion || municipio,
          provinceName: COFC_PROVINCE,
          ...(validCoords ? { lat: lat!, lng: lng! } : {}),
        };

        return { pharmacy, date, startTime, endTime, sourceUrl };
      });
  } catch {
    return [];
  }
}
