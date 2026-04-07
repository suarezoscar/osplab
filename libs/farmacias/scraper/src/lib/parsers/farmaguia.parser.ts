import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import { formatSpainDate, formatSpainTime } from '../utils/spain-date.util';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes del endpoint
// ──────────────────────────────────────────────────────────────────────────────

/**
 * URL de la página principal de Farmaguia.
 * Se debe visitar primero para inicializar la sesión PHP (PHPSESSID).
 * Sin este paso, la API de datos devuelve un array vacío.
 */
export const FARMAGUIA_INDEX_URL = 'https://www.farmaguia.net/desktop/index.html';

/**
 * URL del archivo JavaScript que contiene el MagicKey dinámico.
 * Se debe extraer el valor de `LANGUAGE["MagicKey"]` mediante regex.
 */
export const FARMAGUIA_LANG_URL =
  'https://www.farmaguia.net/desktop/include/lang/lang.js?language=ca';

/**
 * URL del endpoint de datos de Farmaguia.
 * Requiere el parámetro `mk` (MagicKey) obtenido del lang.js.
 */
export const FARMAGUIA_DATA_URL = 'https://www.farmaguia.net/desktop/data.html';

/** Coordenadas del centro de Barcelona para búsqueda con radio amplio. */
export const FARMAGUIA_CENTER_LAT = 41.3888;
export const FARMAGUIA_CENTER_LNG = 2.159;

/** Radio enorme para capturar toda la comunidad autónoma. */
export const FARMAGUIA_RADIUS = 99999999999;

/** Límite alto de resultados. */
export const FARMAGUIA_LIMIT = 10000;

/** @deprecated Usa FARMAGUIA_PROVINCES para resolver la provincia real por código postal. */
export const FARMAGUIA_PROVINCE = 'Barcelona';
/** @deprecated Usa FARMAGUIA_PROVINCES para resolver la provincia real por código postal. */
export const FARMAGUIA_PROVINCE_CODE = 'B';

// ──────────────────────────────────────────────────────────────────────────────
// Mapa de provincias catalanas por prefijo de código postal
// ──────────────────────────────────────────────────────────────────────────────

export interface FarmaguiaProvinceInfo {
  name: string;
  code: string;
}

/**
 * Mapa de prefijos de código postal a provincia catalana.
 *
 * - 08xxx → Barcelona (B)
 * - 17xxx → Gerona (GI)
 * - 25xxx → Lérida (L)
 * - 43xxx → Tarragona (T)
 */
export const FARMAGUIA_PROVINCES: ReadonlyMap<string, FarmaguiaProvinceInfo> = new Map([
  ['08', { name: 'Barcelona', code: 'B' }],
  ['17', { name: 'Gerona', code: 'GI' }],
  ['25', { name: 'Lérida', code: 'L' }],
  ['43', { name: 'Tarragona', code: 'T' }],
]);

/** Provincia por defecto cuando el código postal no está en el mapa. */
export const FARMAGUIA_DEFAULT_PROVINCE: FarmaguiaProvinceInfo = { name: 'Barcelona', code: 'B' };

/**
 * Resuelve la provincia catalana a partir de un código postal de 5 dígitos.
 *
 * @param postalCode - Código postal (e.g. "08007", "17001", "25003", "43001")
 * @returns          - Información de la provincia o el default si no se reconoce
 */
export function resolveProvinceFromPostalCode(postalCode: string | null): FarmaguiaProvinceInfo {
  if (!postalCode || postalCode.length < 2) return FARMAGUIA_DEFAULT_PROVINCE;
  const prefix = postalCode.slice(0, 2);
  return FARMAGUIA_PROVINCES.get(prefix) ?? FARMAGUIA_DEFAULT_PROVINCE;
}

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de la respuesta de la API
// ──────────────────────────────────────────────────────────────────────────────

export interface FarmaguiaPharmacy {
  NumeroFarmacia: string;
  Nom: string;
  Tipus: string;
  Latitud: string;
  Longitud: string;
  Distancia: string;
  /** Dirección con formato "CALLE, POSTAL, CIUDAD" */
  Adreca: string;
  Telefon: string;
  webAddress: string;
  mobile: string;
  whatsapp: string;
  Serveis: string;
  /** "1" si abierta, "0" si cerrada */
  Oberta: string;
  /** "1" si es de guardia, null si no */
  Guardia: string | null;
  /** Horario resumido: " 09:00-22:00" */
  HorariS: string;
  Horari: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades de parseo
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extrae el MagicKey del contenido del archivo lang.js.
 *
 * Busca el patrón: `LANGUAGE["MagicKey"] = "hash_alfanumerico";`
 * Retorna null si no se encuentra.
 */
export function extractMagicKey(jsContent: string): string | null {
  const match = jsContent?.match(/LANGUAGE\["MagicKey"\]\s*=\s*"([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Parsea las coordenadas de la API de Farmaguia.
 * Valida que sean números dentro de rangos geográficos válidos.
 */
export function parseFarmaguiaCoordinates(
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
 * Parsea el campo `Adreca` y extrae dirección, código postal y ciudad.
 *
 * Formatos soportados:
 * - "RB CATALUNYA,1  , 08007, BARCELONA" → { address: "RB CATALUNYA,1", postalCode: "08007", city: "BARCELONA" }
 * - " POTOSÍ, LOCAL C 25,2  , 08030, BARCELONA" → { address: "POTOSÍ, LOCAL C 25,2", postalCode: "08030", city: "BARCELONA" }
 *
 * Retorna null si la dirección está vacía.
 */
export function parseFarmaguiaAddress(
  raw: string,
): { address: string; city: string; postalCode: string | null } | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  // Buscar patrón: ", POSTAL, CIUDAD" al final
  const match = trimmed.match(/^(.+),\s*(\d{5})\s*,\s*(.+)$/);
  if (match) {
    return {
      address: match[1].trim(),
      postalCode: match[2],
      city: match[3].trim(),
    };
  }

  // Fallback: usar toda la cadena como dirección
  return { address: trimmed, postalCode: null, city: FARMAGUIA_DEFAULT_PROVINCE.name };
}

/**
 * Parsea el campo `HorariS` y extrae los tramos horarios.
 *
 * Formatos soportados:
 * - " 09:00-22:00"                → [{ start: "09:00", end: "22:00" }]
 * - " 08:00-14:00 17:00-22:00"   → [{ start: "08:00", end: "14:00" }, { start: "17:00", end: "22:00" }]
 * - " 00:00-23:59"                → [{ start: "00:00", end: "23:59" }] (24h)
 *
 * Retorna [] si el formato no es reconocido.
 */
export function parseFarmaguiaSchedule(horariS: string): { start: string; end: string }[] {
  if (!horariS?.trim()) return [];

  const TIME_RANGE = /(\d{2}:\d{2})-(\d{2}:\d{2})/g;
  const result: { start: string; end: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = TIME_RANGE.exec(horariS)) !== null) {
    result.push({ start: match[1], end: match[2] });
  }

  return result;
}

/**
 * Construye la URL completa de la API de datos de Farmaguia.
 *
 * @param magicKey - MagicKey obtenido del lang.js
 * @param date     - Fecha/hora para la consulta (opcional; si se omite, usa tiempo real)
 */
export function buildFarmaguiaUrl(magicKey: string, date?: Date): string {
  const params = new URLSearchParams({
    a: 'posicio',
    lat: FARMAGUIA_CENTER_LAT.toString(),
    lon: FARMAGUIA_CENTER_LNG.toString(),
    r: FARMAGUIA_RADIUS.toString(),
    l: FARMAGUIA_LIMIT.toString(),
    t: '1', // Todas las farmacias, filtramos nosotros por Guardia
    mk: magicKey,
    i: '',
  });

  // URLSearchParams codifica espacios como "+", pero Farmaguia espera "%20".
  // Usamos replaceAll para corregirlo.
  let qs = params.toString().replace(/\+/g, '%20');

  if (date) {
    const dateStr = formatSpainDate(date);
    const timeStr = formatSpainTime(date).slice(0, 5); // HH:MM (sin segundos)
    qs += `&h=${encodeURIComponent(`${dateStr} ${timeStr}`)}`;
  }

  return `${FARMAGUIA_DATA_URL}?${qs}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convierte la respuesta JSON de la API de Farmaguia en un array de
 * `ScrapedDutySchedule`.
 *
 * La API devuelve un objeto `{ farmacias: [...], hospitales: [...], ... }`.
 * También acepta un array directo como fallback por compatibilidad.
 *
 * - Solo se incluyen farmacias con `Guardia === "1"`.
 * - Si el JSON no tiene la estructura esperada → retorna [] (fail silently).
 * - Si una entrada individual es inválida → se omite esa entrada.
 *
 * @param data      - Respuesta JSON ya parseada de la API
 * @param date      - Fecha de referencia para los turnos
 * @param sourceUrl - URL de origen (para auditoría)
 */
export function parseFarmaguiaResponse(
  data: unknown,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    // La API devuelve { farmacias: [...], hospitales: [...], caps: [...], anuncios: [...] }
    let items: FarmaguiaPharmacy[];

    if (Array.isArray(data)) {
      // Fallback: array directo (fixtures / formato antiguo)
      items = data as FarmaguiaPharmacy[];
    } else if (
      data != null &&
      typeof data === 'object' &&
      'farmacias' in data &&
      Array.isArray((data as Record<string, unknown>)['farmacias'])
    ) {
      items = (data as { farmacias: FarmaguiaPharmacy[] }).farmacias;
    } else {
      return [];
    }

    if (items.length === 0) return [];
    const schedules: ScrapedDutySchedule[] = [];

    for (const item of items) {
      try {
        // Solo incluimos farmacias de guardia
        if (item.Guardia !== '1') continue;

        // Parsear dirección
        const parsed = parseFarmaguiaAddress(item.Adreca);
        if (!parsed) continue;

        // Resolver provincia real por código postal
        const province = resolveProvinceFromPostalCode(parsed.postalCode);

        // Parsear horario
        const timeSlots = parseFarmaguiaSchedule(item.HorariS);
        if (timeSlots.length === 0) continue;

        // Coordenadas (opcionales — validadas)
        const coords = parseFarmaguiaCoordinates(item.Latitud, item.Longitud);

        // Nombre: "Farmacia" + nombre del farmacéutico
        const nom = item.Nom?.trim();
        const name = nom ? `Farmacia ${nom}` : `Farmacia ${parsed.address}`;

        const pharmacy = {
          name,
          address: parsed.address,
          phone: item.Telefon?.replace(/\D/g, '').slice(0, 9) || undefined,
          cityName: parsed.city,
          provinceName: province.name,
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
