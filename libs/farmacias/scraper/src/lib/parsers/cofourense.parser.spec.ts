import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parseApiTime,
  parseCoordinates,
  resolvePharmacyName,
  resolveOwnerName,
  parseCofourenseResponse,
  buildCofourenseUrl,
  COFOURENSE_API_BASE,
  COFOURENSE_UUID,
  COFOURENSE_PROVINCE,
  type CofApiResponse,
} from './cofourense.parser';

const fixtureData: CofApiResponse = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/cofourense-response.json'), 'utf8'),
);

// ─── parseApiTime ─────────────────────────────────────────────────────────────

describe('parseApiTime', () => {
  it('convierte HH:MM:SS → HH:MM', () => {
    expect(parseApiTime('09:30:00')).toBe('09:30');
  });

  it('acepta formato HH:MM sin segundos', () => {
    expect(parseApiTime('22:00')).toBe('22:00');
  });

  it('retorna null para string inválido', () => {
    expect(parseApiTime('hora incorrecta')).toBeNull();
  });

  it('retorna null para string vacío', () => {
    expect(parseApiTime('')).toBeNull();
  });

  it('retorna null si es undefined', () => {
    expect(parseApiTime(undefined as unknown as string)).toBeNull();
  });
});

// ─── parseCoordinates ─────────────────────────────────────────────────────────

describe('parseCoordinates', () => {
  it('parsea coordenadas válidas "[42.41,-6.98]"', () => {
    expect(parseCoordinates('[42.415296,-6.987211]')).toEqual({
      lat: 42.415296,
      lng: -6.987211,
    });
  });

  it('retorna null si lng está fuera de rango', () => {
    expect(parseCoordinates('[4.2188,-779.9320]')).toBeNull();
  });

  it('retorna null si lat fuera de rango', () => {
    expect(parseCoordinates('[91.0,-7.0]')).toBeNull();
  });

  it('retorna null para string vacío', () => {
    expect(parseCoordinates('')).toBeNull();
  });

  it('retorna null para formato incorrecto', () => {
    expect(parseCoordinates('42.41,-6.98')).toBeNull(); // sin corchetes
  });

  it('admite espacios dentro de los corchetes', () => {
    expect(parseCoordinates('[ 42.33 , -7.86 ]')).toEqual({
      lat: 42.33,
      lng: -7.86,
    });
  });
});

// ─── resolvePharmacyName ──────────────────────────────────────────────────────

describe('resolvePharmacyName', () => {
  it('usa nombre_fiscal si no está vacío', () => {
    expect(resolvePharmacyName('FARMACIA GARCÍA', 'García López')).toBe('FARMACIA GARCÍA');
  });

  it('usa nombre si nombre_fiscal está vacío', () => {
    expect(resolvePharmacyName('', 'Carlos Pérez')).toBe('Carlos Pérez');
  });

  it('usa nombre si nombre_fiscal es solo espacios', () => {
    expect(resolvePharmacyName('   ', 'Carlos Pérez')).toBe('Carlos Pérez');
  });

  it('retorna "Farmacia desconocida" si ambos están vacíos', () => {
    expect(resolvePharmacyName('', '')).toBe('Farmacia desconocida');
  });
});

// ─── resolveOwnerName ─────────────────────────────────────────────────────────

describe('resolveOwnerName', () => {
  it('devuelve el nombre del titular cuando hay nombre_fiscal', () => {
    expect(resolveOwnerName('FARMACIA GARCÍA', 'María García López')).toBe('María García López');
  });

  it('devuelve undefined cuando nombre_fiscal está vacío (name ya es el titular)', () => {
    expect(resolveOwnerName('', 'Carlos Pérez')).toBeUndefined();
  });

  it('devuelve undefined cuando ambos están vacíos', () => {
    expect(resolveOwnerName('', '')).toBeUndefined();
  });
});

// ─── parseCofourenseResponse ──────────────────────────────────────────────────

describe('parseCofourenseResponse', () => {
  const targetDate = new Date('2026-04-06T00:00:00');
  const url = 'https://example.com/api';

  it('retorna todos los schedules de la respuesta (sin filtrar por fecha)', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result).toHaveLength(3);
  });

  it('usa nombre_fiscal cuando está disponible', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[0].pharmacy.name).toBe('FARMACIA GARCÍA');
  });

  it('cae back al nombre cuando nombre_fiscal está vacío', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[1].pharmacy.name).toBe('Carlos Pérez Gómez');
  });

  it('popula ownerName cuando hay nombre_fiscal', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[0].pharmacy.ownerName).toBe('María García López');
  });

  it('ownerName es undefined cuando no hay nombre_fiscal', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[1].pharmacy.ownerName).toBeUndefined();
  });

  it('parsea las coordenadas correctamente', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[0].pharmacy.lat).toBeCloseTo(42.3369);
    expect(result[0].pharmacy.lng).toBeCloseTo(-7.8638);
  });

  it('parsea el horario de apertura correctamente', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[0].startTime).toBe('09:00');
    expect(result[0].endTime).toBe('22:00');
  });

  it('asigna provinceName = Ourense', () => {
    const result = parseCofourenseResponse(fixtureData, targetDate, url);
    expect(result[0].pharmacy.provinceName).toBe(COFOURENSE_PROVINCE);
  });

  it('retorna [] si data es null', () => {
    expect(parseCofourenseResponse(null, targetDate, url)).toEqual([]);
  });

  it('retorna [] si informacion está vacío', () => {
    expect(
      parseCofourenseResponse(
        { informacion: [], metadatos: { paginacion: { totalElementos: 0 } } },
        targetDate,
        url,
      ),
    ).toEqual([]);
  });

  it('omite items sin contactos_profesionales', () => {
    const data: CofApiResponse = {
      informacion: [
        {
          fecha: '2026-04-06',
          soe: 'OR999',
          nombre: 'Sin Contacto',
          nombre_fiscal: '',
          zona_guardia: 'X',
          contactos_profesionales: [],
          horarios: [
            {
              tipo: 'diurna',
              color: 'green',
              hora_apertura: '09:00:00',
              hora_cierre: '22:00:00',
              cierre_dia_siguiente: false,
            },
          ],
        },
      ],
      metadatos: { paginacion: { totalElementos: 1 } },
    };
    expect(parseCofourenseResponse(data, targetDate, url)).toEqual([]);
  });

  it('no lanza si la estructura es completamente inesperada', () => {
    expect(() => parseCofourenseResponse('cadena aleatoria', targetDate, url)).not.toThrow();
    expect(parseCofourenseResponse('cadena aleatoria', targetDate, url)).toEqual([]);
  });
});

// ─── buildCofourenseUrl ───────────────────────────────────────────────────────

describe('buildCofourenseUrl', () => {
  it('incluye la URL base', () => {
    const url = buildCofourenseUrl(new Date('2026-04-06T14:30:00'));
    expect(url).toContain(COFOURENSE_API_BASE);
  });

  it('incluye fecha_inicio en formato YYYY-MM-DD', () => {
    const url = buildCofourenseUrl(new Date('2026-04-06T14:30:00'));
    expect(url).toContain('fecha_inicio=2026-04-06');
  });

  it('incluye hora_inicio con segundos', () => {
    const url = buildCofourenseUrl(new Date('2026-04-06T14:30:45'));
    expect(url).toContain('hora_inicio=14%3A30%3A45');
  });

  it('incluye el UUID estático', () => {
    const url = buildCofourenseUrl(new Date('2026-04-06'));
    expect(url).toContain(COFOURENSE_UUID);
  });
});
