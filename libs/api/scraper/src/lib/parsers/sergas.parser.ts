import * as cheerio from 'cheerio';
import type { ScrapedDutySchedule, ScrapedPharmacy } from '../interfaces/scraper.interfaces';

/**
 * URL base del portal de farmacias de guardia del SERGAS (Galicia).
 * Una URL por provincia con el parámetro de fecha.
 */
export const SERGAS_URLS: Record<string, string> = {
  'A Coruña':
    'https://www.sergas.es/Saude-publica/Farmacia-de-garda?provincia=1',
  Lugo: 'https://www.sergas.es/Saude-publica/Farmacia-de-garda?provincia=2',
  Ourense:
    'https://www.sergas.es/Saude-publica/Farmacia-de-garda?provincia=3',
  Pontevedra:
    'https://www.sergas.es/Saude-publica/Farmacia-de-garda?provincia=4',
};

export const SERGAS_PROVINCE_CODE = 'GA';

/**
 * Normaliza un string de horario como "09:00 - 21:00" en sus partes.
 * Retorna null si el formato no es reconocido (fail silently).
 */
export function parseTimeRange(raw: string): { start: string; end: string } | null {
  // Acepta: "09:00 - 21:00", "09:00-21:00", "9:00 a 21:00"
  const match = raw
    .trim()
    .match(/(\d{1,2}:\d{2})\s*(?:-|a|hasta)\s*(\d{1,2}:\d{2})/i);
  if (!match) return null;

  const pad = (t: string) => t.padStart(5, '0'); // "9:00" → "09:00"
  return { start: pad(match[1]), end: pad(match[2]) };
}

/**
 * Extrae el nombre limpio de la farmacia (quita prefijos "Farmacia", "Farm.")
 */
export function normalizePharmacyName(raw: string): string {
  return raw
    .replace(/^farm(acia)?\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parser principal del HTML del SERGAS.
 *
 * IMPORTANTE: Si la estructura HTML cambia, esta función retorna [] (array vacío)
 * sin lanzar excepciones — según la regla de negocio de AGENT.MD.
 *
 * @param html    - HTML crudo de la página del SERGAS
 * @param province - Nombre de la provincia ("A Coruña", "Lugo", etc.)
 * @param date    - Fecha para la que aplican los turnos
 * @param sourceUrl - URL de origen (para auditoría)
 */
export function parseSergasHtml(
  html: string,
  province: string,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  try {
    const $ = cheerio.load(html);
    const schedules: ScrapedDutySchedule[] = [];

    // El SERGAS usa una tabla con clase .tabla-farmacias o similar.
    // Selector principal — si no encuentra nada, retorna [] silenciosamente.
    const rows = $('table tr, .farmacia-item, .garda-item').filter(
      (_i, el) => {
        const text = $(el).text().trim();
        return text.length > 10; // Filtrar filas vacías
      },
    );

    if (rows.length === 0) {
      // Intentar selector alternativo (estructura lista)
      return parseAlternativeStructure($, province, date, sourceUrl);
    }

    rows.each((_i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const rawName = cells.eq(0).text().trim();
      const rawAddress = cells.eq(1).text().trim();
      const rawPhone = cells.eq(2).text().trim() || undefined;
      const rawHorario = cells.eq(3).text().trim();
      const rawCity = cells.eq(4).text().trim() || province;

      if (!rawName || !rawAddress) return; // Fila inválida, saltar

      const timeRange = parseTimeRange(rawHorario);
      if (!timeRange) return; // Horario no parseable, saltar esta fila

      const pharmacy: ScrapedPharmacy = {
        name: normalizePharmacyName(rawName),
        address: rawAddress,
        phone: rawPhone?.replace(/\D/g, '').slice(0, 9) || undefined,
        cityName: rawCity,
        provinceName: province,
      };

      schedules.push({
        pharmacy,
        date,
        startTime: timeRange.start,
        endTime: timeRange.end,
        sourceUrl,
      });
    });

    return schedules;
  } catch {
    // Si cualquier cosa falla, retornar [] sin propagar el error
    return [];
  }
}

/**
 * Intenta parsear una estructura alternativa de lista (no tabla).
 * El SERGAS a veces usa divs en lugar de tabla.
 */
function parseAlternativeStructure(
  $: cheerio.CheerioAPI,
  province: string,
  date: Date,
  sourceUrl: string,
): ScrapedDutySchedule[] {
  const schedules: ScrapedDutySchedule[] = [];

  // Patrón alternativo: elementos con datos de farmacia en divs/listas
  $('[class*="farmacia"], [class*="garda"], [class*="guardia"]').each(
    (_i, el) => {
      try {
        const name = $(el).find('[class*="nombre"], [class*="nome"], h3, h4').first().text().trim();
        const address = $(el).find('[class*="direcci"], [class*="endere"], address').first().text().trim();
        const phone = $(el).find('[class*="telefon"], [class*="telf"]').first().text().trim();
        const horario = $(el).find('[class*="horario"], [class*="hora"], time').first().text().trim();
        const city = $(el).find('[class*="concello"], [class*="municipio"], [class*="ciudad"]').first().text().trim();

        if (!name || !address) return;

        const timeRange = parseTimeRange(horario);
        if (!timeRange) return;

        schedules.push({
          pharmacy: {
            name: normalizePharmacyName(name),
            address,
            phone: phone?.replace(/\D/g, '').slice(0, 9) || undefined,
            cityName: city || province,
            provinceName: province,
          },
          date,
          startTime: timeRange.start,
          endTime: timeRange.end,
          sourceUrl,
        });
      } catch {
        // Fallar silenciosamente en cada elemento
      }
    },
  );

  return schedules;
}

