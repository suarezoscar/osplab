import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  formatDateForCofpo,
  parseObservaciones,
  resolveTimeRange,
  parseCofpontevedraItems,
  COFPONTEVEDRA_PROVINCE,
} from './cofpontevedra.parser';

const fixtureItems = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '__fixtures__/cofpontevedra-items.json'),
    'utf8',
  ),
);

// ─── formatDateForCofpo ───────────────────────────────────────────────────────

describe('formatDateForCofpo', () => {
  it('formatea la fecha como DD/MM/YYYY', () => {
    expect(formatDateForCofpo(new Date('2026-04-06'))).toBe('06/04/2026');
  });

  it('rellena día y mes con ceros', () => {
    expect(formatDateForCofpo(new Date('2026-01-05'))).toBe('05/01/2026');
  });
});

// ─── parseObservaciones ───────────────────────────────────────────────────────

describe('parseObservaciones', () => {
  it('parsea "De 9:30 h. a 22 h." correctamente', () => {
    expect(parseObservaciones('De 9:30 h. a 22 h.')).toEqual({
      start: '09:30',
      end: '22:00',
    });
  });

  it('parsea "De 9 h. a 21:30 h." con solo hora entera al inicio', () => {
    expect(parseObservaciones('De 9 h. a 21:30 h.')).toEqual({
      start: '09:00',
      end: '21:30',
    });
  });

  it('es case-insensitive', () => {
    expect(parseObservaciones('de 9:00 h. a 22:00 h.')).not.toBeNull();
  });

  it('retorna null si el texto no tiene patrón de horas', () => {
    expect(parseObservaciones('Sin horario especial')).toBeNull();
  });

  it('retorna null para string vacío', () => {
    expect(parseObservaciones('')).toBeNull();
  });
});

// ─── resolveTimeRange ─────────────────────────────────────────────────────────

describe('resolveTimeRange', () => {
  it('observaciones tienen prioridad sobre tipo', () => {
    expect(resolveTimeRange(['Diurno'], ['De 8 h. a 20 h.'])).toEqual({
      startTime: '08:00',
      endTime: '20:00',
    });
  });

  it('Diurno + Nocturno → guardia 24h (09:00 / 09:00)', () => {
    expect(resolveTimeRange(['Diurno', 'Nocturno'], ['', ''])).toEqual({
      startTime: '09:00',
      endTime: '09:00',
    });
  });

  it('solo Nocturno → 22:00 / 09:00', () => {
    expect(resolveTimeRange(['Nocturno'], [''])).toEqual({
      startTime: '22:00',
      endTime: '09:00',
    });
  });

  it('solo Diurno → 09:00 / 22:00', () => {
    expect(resolveTimeRange(['Diurno'], [''])).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });

  it('ignora observaciones vacías y pasa al siguiente', () => {
    expect(resolveTimeRange(['Nocturno'], ['', ''])).toEqual({
      startTime: '22:00',
      endTime: '09:00',
    });
  });
});

// ─── parseCofpontevedraItems ──────────────────────────────────────────────────

describe('parseCofpontevedraItems', () => {
  const targetDate = new Date('2026-04-06T00:00:00');
  const url = 'https://example.com/guardia';

  it('retorna 2 schedules para 2026-04-06 (el item de ayer se filtra)', () => {
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    expect(result).toHaveLength(2);
  });

  it('agrupa Diurno+Nocturno del mismo id en un único schedule', () => {
    // id "101" tiene dos items (Diurno + Nocturno) → debe ser 1 schedule
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    const pontevedra = result.filter((s) => s.pharmacy.cityName === 'Pontevedra');
    expect(pontevedra).toHaveLength(1);
  });

  it('las observaciones se usan para resolver el horario de id 101', () => {
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    const farm = result.find((s) => s.pharmacy.name === 'FARMACIA PONTEVEDRA CENTRO');
    expect(farm?.startTime).toBe('09:30');
    expect(farm?.endTime).toBe('22:00');
  });

  it('asigna coordenadas correctamente', () => {
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    const farm = result.find((s) => s.pharmacy.name === 'FARMACIA PONTEVEDRA CENTRO');
    expect(farm?.pharmacy.lat).toBeCloseTo(42.4316);
    expect(farm?.pharmacy.lng).toBeCloseTo(-8.6436);
  });

  it('asigna provinceName = Pontevedra', () => {
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    expect(result[0].pharmacy.provinceName).toBe(COFPONTEVEDRA_PROVINCE);
  });

  it('retorna [] si data no es array', () => {
    expect(parseCofpontevedraItems({}, targetDate, url)).toEqual([]);
    expect(parseCofpontevedraItems(null, targetDate, url)).toEqual([]);
  });

  it('retorna [] si data es array vacío', () => {
    expect(parseCofpontevedraItems([], targetDate, url)).toEqual([]);
  });

  it('retorna [] si no hay items para la fecha objetivo', () => {
    const result = parseCofpontevedraItems(
      fixtureItems,
      new Date('2030-01-01T00:00:00'),
      url,
    );
    expect(result).toEqual([]);
  });

  it('asigna el sourceUrl correcto', () => {
    const result = parseCofpontevedraItems(fixtureItems, targetDate, url);
    expect(result[0].sourceUrl).toBe(url);
  });
});

