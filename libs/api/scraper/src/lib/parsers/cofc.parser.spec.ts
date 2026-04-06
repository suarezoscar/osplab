import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  formatDateForCofc,
  parseCofcSchedule,
  buildCofcCoordsMap,
  parseCofcResponse,
  COFC_PROVINCE,
  type CofcApiResponse,
  type CofcMapItem,
  type CofcListadoItem,
} from './cofc.parser';

const fixtureData: CofcApiResponse = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/cofc-response.json'), 'utf8'),
);

// ─── formatDateForCofc ────────────────────────────────────────────────────────

describe('formatDateForCofc', () => {
  it('formatea la fecha como DD/MM/YYYY', () => {
    expect(formatDateForCofc(new Date('2026-04-06'))).toBe('06/04/2026');
  });

  it('rellena día y mes con ceros', () => {
    expect(formatDateForCofc(new Date('2026-01-05'))).toBe('05/01/2026');
  });
});

// ─── parseCofcSchedule ────────────────────────────────────────────────────────

describe('parseCofcSchedule', () => {
  it('parsea "De 09:30 h. a 22:00 h." correctamente', () => {
    expect(parseCofcSchedule('De 09:30 h. a 22:00 h.')).toEqual({
      startTime: '09:30',
      endTime: '22:00',
    });
  });

  it('parsea "De 22:00 h. a 09:30 h." (nocturno con horas explícitas)', () => {
    expect(parseCofcSchedule('De 22:00 h. a 09:30 h.')).toEqual({
      startTime: '22:00',
      endTime: '09:30',
    });
  });

  it('parsea horas sin minutos: "De 9 h. a 22 h."', () => {
    expect(parseCofcSchedule('De 9 h. a 22 h.')).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });

  it('parsea formato real API "HH:MM - HH:MM"', () => {
    expect(parseCofcSchedule('09:30 - 22:00')).toEqual({
      startTime: '09:30',
      endTime: '22:00',
    });
  });

  it('parsea formato real API nocturno "22:00 - 09:30"', () => {
    expect(parseCofcSchedule('22:00 - 09:30')).toEqual({
      startTime: '22:00',
      endTime: '09:30',
    });
  });

  it('parsea formato real con sufijo "(día posterior)"', () => {
    expect(parseCofcSchedule('00:00 - 09:30 (día posterior)')).toEqual({
      startTime: '00:00',
      endTime: '09:30',
    });
  });

  it('guardia 24 horas → 09:00 / 09:00', () => {
    expect(parseCofcSchedule('Guardia 24 horas')).toEqual({
      startTime: '09:00',
      endTime: '09:00',
    });
  });

  it('24h en el texto → 09:00 / 09:00', () => {
    expect(parseCofcSchedule('24h')).toEqual({
      startTime: '09:00',
      endTime: '09:00',
    });
  });

  it('guardia nocturna (texto) → 22:00 / 09:00', () => {
    expect(parseCofcSchedule('Guardia nocturna')).toEqual({
      startTime: '22:00',
      endTime: '09:00',
    });
  });

  it('guardia diurna (texto) → 09:00 / 22:00 (default)', () => {
    expect(parseCofcSchedule('Guardia diurna')).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });

  it('string vacío → default diurno 09:00 / 22:00', () => {
    expect(parseCofcSchedule('')).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });
});

// ─── buildCofcCoordsMap ───────────────────────────────────────────────────────

describe('buildCofcCoordsMap', () => {
  const items: CofcMapItem[] = [
    { lat: 43.37, lng: -8.4, titulo: 'FARMACIA A', id: 1 },
    { lat: 43.36, lng: -8.41, titulo: 'farmacia b', id: 2 },
  ];

  it('construye el mapa con claves en mayúsculas', () => {
    const map = buildCofcCoordsMap(items);
    expect(map.has('FARMACIA A')).toBe(true);
    expect(map.has('FARMACIA B')).toBe(true);
  });

  it('los valores son lat/lng correctos', () => {
    const map = buildCofcCoordsMap(items);
    expect(map.get('FARMACIA A')).toEqual({ lat: 43.37, lng: -8.4 });
  });

  it('retorna mapa vacío si el array está vacío', () => {
    expect(buildCofcCoordsMap([])).toEqual(new Map());
  });

  it('ignora items sin título', () => {
    const map = buildCofcCoordsMap([{ lat: 1, lng: 1, titulo: '', id: 99 }]);
    expect(map.size).toBe(0);
  });
});

// ─── parseCofcResponse ────────────────────────────────────────────────────────

describe('parseCofcResponse', () => {
  const targetDate = new Date('2026-04-06T00:00:00');
  const municipio = 'A Coruña';
  const url = 'https://www.cofc.es/farmacia/index';

  it('extrae las 3 farmacias del fixture', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result).toHaveLength(3);
  });

  it('parsea nombre y dirección correctamente', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].pharmacy.name).toBe('FARMACIA CORUÑA CENTRO');
    expect(result[0].pharmacy.address).toContain('Rúa Real');
  });

  it('parsea el teléfono (solo dígitos, máx 9)', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].pharmacy.phone).toBe('981123456');
  });

  it('parsea el horario diurno con horas explícitas', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].startTime).toBe('09:30');
    expect(result[0].endTime).toBe('22:00');
  });

  it('parsea el horario nocturno con horas explícitas', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[1].startTime).toBe('22:00');
    expect(result[1].endTime).toBe('09:30');
  });

  it('parsea la guardia 24h correctamente', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[2].startTime).toBe('09:00');
    expect(result[2].endTime).toBe('09:00');
  });

  it('enriquece con coordenadas de listadoTodas', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].pharmacy.lat).toBeCloseTo(43.3709);
    expect(result[0].pharmacy.lng).toBeCloseTo(-8.3959);
  });

  it('asigna provinceName = A Coruña', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].pharmacy.provinceName).toBe(COFC_PROVINCE);
  });

  it('asigna cityName con el municipio proporcionado', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].pharmacy.cityName).toBe(municipio);
  });

  it('asigna el sourceUrl correcto', () => {
    const result = parseCofcResponse(fixtureData, municipio, targetDate, url);
    expect(result[0].sourceUrl).toBe(url);
  });

  it('retorna [] si listadoTodas está vacío', () => {
    const data: CofcApiResponse = { ...fixtureData, listadoTodas: [] };
    expect(parseCofcResponse(data, municipio, targetDate, url)).toEqual([]);
  });

  it('retorna [] si data es null', () => {
    expect(parseCofcResponse(null, municipio, targetDate, url)).toEqual([]);
  });

  it('retorna [] si listadoTodas es null', () => {
    const data = { ...fixtureData, listadoTodas: null };
    expect(parseCofcResponse(data, municipio, targetDate, url)).toEqual([]);
  });

  it('omite coordenadas si latitud/longitud son nulos pero devuelve farmacias', () => {
    const dataWithoutCoords: CofcApiResponse = {
      ...fixtureData,
      listadoTodas: fixtureData.listadoTodas.map((item: CofcListadoItem) => ({
        ...item,
        latitud: null,
        longitud: null,
      })),
    };
    const result = parseCofcResponse(dataWithoutCoords, municipio, targetDate, url);
    expect(result).toHaveLength(3);
    expect(result[0].pharmacy.lat).toBeUndefined();
    expect(result[0].pharmacy.lng).toBeUndefined();
  });

  it('no lanza si la estructura es completamente inesperada', () => {
    expect(() => parseCofcResponse('cadena aleatoria', municipio, targetDate, url)).not.toThrow();
    expect(parseCofcResponse('cadena aleatoria', municipio, targetDate, url)).toEqual([]);
  });
});
