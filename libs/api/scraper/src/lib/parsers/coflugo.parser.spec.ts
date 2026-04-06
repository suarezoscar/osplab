import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  buildCoflugoUrl,
  parseCoflugoOnclick,
  parseCoflugoScheduleType,
  parseCoflugoHtml,
  COFLUGO_BASE_URL,
  COFLUGO_PROVINCE,
} from './coflugo.parser';

const fixtureHtml = fs.readFileSync(path.join(__dirname, '__fixtures__/coflugo.html'), 'utf8');

// ─── buildCoflugoUrl ──────────────────────────────────────────────────────────

describe('buildCoflugoUrl', () => {
  it('incluye el id en la URL', () => {
    const url = buildCoflugoUrl(122, new Date('2026-04-06'));
    expect(url).toContain(`${COFLUGO_BASE_URL}?id=122`);
  });

  it('formatea la fecha como YYYY-MM-DD', () => {
    const url = buildCoflugoUrl(1, new Date('2026-04-06'));
    expect(url).toContain('f=2026-04-06');
  });

  it('rellena mes y día con ceros', () => {
    const url = buildCoflugoUrl(1, new Date('2026-01-05'));
    expect(url).toContain('f=2026-01-05');
  });
});

// ─── parseCoflugoOnclick ─────────────────────────────────────────────────────

describe('parseCoflugoOnclick', () => {
  it('extrae lat y lng correctamente', () => {
    expect(parseCoflugoOnclick('loadPage(43.2974,-7.6819)')).toEqual({
      lat: 43.2974,
      lng: -7.6819,
    });
  });

  it('retorna null si el argumento es undefined', () => {
    expect(parseCoflugoOnclick(undefined)).toBeNull();
  });

  it('retorna null con formato desconocido', () => {
    expect(parseCoflugoOnclick('goSomewhere(43.29,-7.68)')).toBeNull();
  });

  it('retorna null si lat fuera de rango', () => {
    expect(parseCoflugoOnclick('loadPage(91.0,-7.68)')).toBeNull();
  });

  it('retorna null si lng fuera de rango', () => {
    expect(parseCoflugoOnclick('loadPage(43.29,-181.0)')).toBeNull();
  });

  it('admite espacios entre argumentos', () => {
    const result = parseCoflugoOnclick('loadPage( 43.2974 , -7.6819 )');
    expect(result).toEqual({ lat: 43.2974, lng: -7.6819 });
  });
});

// ─── parseCoflugoScheduleType ─────────────────────────────────────────────────

describe('parseCoflugoScheduleType', () => {
  it('guardia 24 horas → 09:00 / 09:00', () => {
    expect(parseCoflugoScheduleType('Guardia 24 horas')).toEqual({
      startTime: '09:00',
      endTime: '09:00',
    });
  });

  it('con horas explícitas "de 9:30 a 22:00"', () => {
    expect(parseCoflugoScheduleType('Guardia diurna de 9:30 a 22:00 horas')).toEqual({
      startTime: '09:30',
      endTime: '22:00',
    });
  });

  it('guardia nocturna (sin horas) → 22:00 / 09:00', () => {
    expect(parseCoflugoScheduleType('Guardia nocturna')).toEqual({
      startTime: '22:00',
      endTime: '09:00',
    });
  });

  it('guardia diurna por defecto → 09:00 / 22:00', () => {
    expect(parseCoflugoScheduleType('Guardia diurna')).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });

  it('horas sin minutos → rellena con :00', () => {
    expect(parseCoflugoScheduleType('de 9 a 22')).toEqual({
      startTime: '09:00',
      endTime: '22:00',
    });
  });
});

// ─── parseCoflugoHtml ─────────────────────────────────────────────────────────

describe('parseCoflugoHtml', () => {
  const date = new Date('2026-04-06T00:00:00');
  const url = 'https://example.com/guardia';
  const municipio = 'Lugo';

  it('extrae las 3 farmacias del fixture', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result).toHaveLength(3);
  });

  it('parsea nombre y dirección correctamente', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].pharmacy.name).toBe('FARMACIA LUGO CENTRO');
    expect(result[0].pharmacy.address).toContain('Rúa da Raíña');
  });

  it('extrae coordenadas del atributo onclick', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].pharmacy.lat).toBeCloseTo(43.2974);
    expect(result[0].pharmacy.lng).toBeCloseTo(-7.6819);
  });

  it('asigna provinceName correctamente', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].pharmacy.provinceName).toBe(COFLUGO_PROVINCE);
  });

  it('parsea el horario diurno correctamente', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].startTime).toBe('09:00');
    expect(result[0].endTime).toBe('22:00');
  });

  it('parsea el horario nocturno correctamente', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[1].startTime).toBe('22:00');
    expect(result[1].endTime).toBe('09:00');
  });

  it('parsea guardia 24h correctamente', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[2].startTime).toBe('09:00');
    expect(result[2].endTime).toBe('09:00');
  });

  it('retorna [] con HTML vacío sin lanzar', () => {
    expect(parseCoflugoHtml('', municipio, date, url)).toEqual([]);
  });

  it('retorna [] con HTML sin .farmacias', () => {
    expect(parseCoflugoHtml('<html><body><p>nada</p></body></html>', municipio, date, url)).toEqual(
      [],
    );
  });

  it('asigna el sourceUrl correcto', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].sourceUrl).toBe(url);
  });

  it('asigna la fecha correcta al schedule', () => {
    const result = parseCoflugoHtml(fixtureHtml, municipio, date, url);
    expect(result[0].date).toBe(date);
  });
});
