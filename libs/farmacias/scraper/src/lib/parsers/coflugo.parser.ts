import * as cheerio from 'cheerio';
import type { ScrapedDutySchedule } from '../interfaces/scraper.interfaces';
import { formatSpainDate } from '../utils/spain-date.util';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

export const COFLUGO_BASE_URL = 'https://www.coflugo.org/farmacia-guardia.php';
export const COFLUGO_PROVINCE = 'Lugo';
export const COFLUGO_PROVINCE_CODE = 'LU';

/**
 * Municipios de la provincia de Lugo con sus IDs del selector del COFLugo.
 * Extraídos del HTML estático de https://www.coflugo.org/farmacia-guardia
 */
export const COFLUGO_MUNICIPIOS: ReadonlyArray<{ id: number; nombre: string }> = [
  { id: 95, nombre: 'Abadín' },
  { id: 96, nombre: 'Alfoz' },
  { id: 97, nombre: 'Antas de Ulla' },
  { id: 98, nombre: 'Baleira' },
  { id: 160, nombre: 'Baralla' },
  { id: 99, nombre: 'Barreiros' },
  { id: 100, nombre: 'Becerreá' },
  { id: 101, nombre: 'Begonte' },
  { id: 102, nombre: 'Bóveda' },
  { id: 161, nombre: 'Burela' },
  { id: 103, nombre: 'Carballedo' },
  { id: 104, nombre: 'Castro de Rei' },
  { id: 105, nombre: 'Castroverde' },
  { id: 106, nombre: 'Cervantes' },
  { id: 107, nombre: 'Cervo' },
  { id: 110, nombre: 'Chantada' },
  { id: 108, nombre: 'Corgo (O)' },
  { id: 109, nombre: 'Cospeito' },
  { id: 111, nombre: 'Folgoso do Courel' },
  { id: 112, nombre: 'Fonsagrada (A)' },
  { id: 113, nombre: 'Foz' },
  { id: 114, nombre: 'Friol' },
  { id: 116, nombre: 'Guitiriz' },
  { id: 117, nombre: 'Guntín' },
  { id: 118, nombre: 'Incio (O)' },
  { id: 120, nombre: 'Láncara' },
  { id: 121, nombre: 'Lourenzá' },
  { id: 122, nombre: 'Lugo' },
  { id: 123, nombre: 'Meira' },
  { id: 124, nombre: 'Mondoñedo' },
  { id: 125, nombre: 'Monforte de Lemos' },
  { id: 126, nombre: 'Monterroso' },
  { id: 127, nombre: 'Muras' },
  { id: 128, nombre: 'Navia de Suarna' },
  { id: 129, nombre: 'Negueira de Muñiz' },
  { id: 130, nombre: 'Nogais (As)' },
  { id: 131, nombre: 'Ourol' },
  { id: 132, nombre: 'Outeiro de Rei' },
  { id: 133, nombre: 'Palas de Rei' },
  { id: 134, nombre: 'Pantón' },
  { id: 135, nombre: 'Paradela' },
  { id: 136, nombre: 'Páramo (O)' },
  { id: 137, nombre: 'Pastoriza (A)' },
  { id: 138, nombre: 'Pedrafita do Cebreiro' },
  { id: 140, nombre: 'Pobra do Brollón (A)' },
  { id: 139, nombre: 'Pol' },
  { id: 141, nombre: 'Pontenova (A)' },
  { id: 142, nombre: 'Portomarín' },
  { id: 143, nombre: 'Quiroga' },
  { id: 149, nombre: 'Rábade' },
  { id: 144, nombre: 'Ribadeo' },
  { id: 145, nombre: 'Ribas de Sil' },
  { id: 146, nombre: 'Ribeira de Piquín' },
  { id: 147, nombre: 'Riotorto' },
  { id: 148, nombre: 'Samos' },
  { id: 150, nombre: 'Sarria' },
  { id: 151, nombre: 'Saviñao (O)' },
  { id: 152, nombre: 'Sober' },
  { id: 153, nombre: 'Taboada' },
  { id: 154, nombre: 'Trabada' },
  { id: 155, nombre: 'Triacastela' },
  { id: 156, nombre: 'Valadouro (O)' },
  { id: 157, nombre: 'Vicedo (O)' },
  { id: 158, nombre: 'Vilalba' },
  { id: 159, nombre: 'Viveiro' },
  { id: 115, nombre: 'Xermade' },
  { id: 119, nombre: 'Xove' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Construye la URL de consulta de la página de guardia del COFLugo.
 *
 * @param municipioId - ID del municipio (extraído del select de la web)
 * @param date        - Fecha de consulta
 */
export function buildCoflugoUrl(municipioId: number, date: Date): string {
  const dateStr = formatSpainDate(date);
  return `${COFLUGO_BASE_URL}?id=${municipioId}&f=${dateStr}`;
}

/**
 * Extrae coordenadas del atributo `onclick` del enlace de la farmacia.
 * Formato esperado: `loadPage(43.2974,-7.6819)`
 *
 * @returns { lat, lng } o null si no se puede parsear
 */
export function parseCoflugoOnclick(
  onclick: string | undefined,
): { lat: number; lng: number } | null {
  if (!onclick) return null;

  const match = onclick.match(/loadPage\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

/**
 * Determina startTime/endTime a partir del texto del horario de guardia.
 *
 * Textos típicos:
 *   "Guardia 24 horas"
 *   "Guardia diurna de 9:30 a 22:00 horas"
 *   "Guardia nocturna de 22:00 a 9:30 horas"
 */
export function parseCoflugoScheduleType(tipo: string): { startTime: string; endTime: string } {
  const lower = tipo.toLowerCase();

  // Intentar extraer horas explícitas: "de HH:MM a HH:MM"
  const timeMatch = lower.match(/de\s+(\d{1,2}(?::\d{2})?)\s*a\s+(\d{1,2}(?::\d{2})?)/);
  if (timeMatch) {
    const pad = (t: string) => {
      const parts = t.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1] ?? '00'}`;
    };
    return { startTime: pad(timeMatch[1]), endTime: pad(timeMatch[2]) };
  }

  if (lower.includes('24')) {
    return { startTime: '09:00', endTime: '09:00' };
  }
  if (lower.includes('nocturna') || lower.includes('nocturno')) {
    return { startTime: '22:00', endTime: '09:00' };
  }
  // Diurna (default)
  return { startTime: '09:00', endTime: '22:00' };
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parsea el HTML de respuesta de la página de guardia del COFLugo.
 *
 * - Itera sobre cada `.farmacias` div.
 * - Extrae nombre, dirección, teléfono, horario y coordenadas.
 * - Falla silenciosamente por entrada individual si algo es inesperado.
 *
 * @param html       - HTML de la respuesta
 * @param municipio  - Nombre del municipio (para cityName)
 * @param date       - Fecha de guardia
 * @param sourceUrl  - URL de origen (para auditoría)
 */
export function parseCoflugoHtml(
  html: string,
  municipio: string,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    const $ = cheerio.load(html);
    const schedules: ScrapedDutySchedule[] = [];

    $('.farmacias').each((_i, el) => {
      try {
        const container = $(el);

        // ── Nombre + Coordenadas ────────────────────────────────────────────
        const nameLink = container.find('p:nth-of-type(1) a').first();
        const name = nameLink.text().trim();
        if (!name) return; // Sin nombre → omitir

        const onclick = nameLink.attr('onclick');
        const coords = parseCoflugoOnclick(onclick);

        // ── Dirección ────────────────────────────────────────────────────────
        // El <p> puede contener <br> y texto suelto, normalizamos los saltos
        const addressPEl = container.find('p:nth-of-type(2)');
        const address = addressPEl.text().replace(/\s+/g, ' ').trim();

        if (!address) return;

        // ── Teléfono ─────────────────────────────────────────────────────────
        const telEl = container.find('a[href^="tel:"]').first();
        const phone =
          telEl.attr('href')?.replace('tel:', '').replace(/\D/g, '').slice(0, 9) ||
          telEl.text().replace(/\D/g, '').slice(0, 9) ||
          undefined;

        // ── Tipo de guardia / horario ────────────────────────────────────────
        // Usamos [style*="green"] para ser resilientes ante variaciones de
        // formato CSS inline (ej: "color:green" vs "color: green").
        const scheduleType = container.find('span[style*="green"]').first().text().trim();

        const { startTime, endTime } = parseCoflugoScheduleType(scheduleType);

        const pharmacy = {
          name,
          address,
          phone: phone || undefined,
          cityName: municipio,
          provinceName: COFLUGO_PROVINCE,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        };

        schedules.push({ pharmacy, date, startTime, endTime, sourceUrl });
      } catch {
        // Fallo silencioso por entrada individual
      }
    });

    return schedules;
  } catch {
    return [];
  }
}
