import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parseCofmCoordinates,
  parseCofmSchedule,
  buildCofmPharmacyName,
  parseCofmResponse,
  COFM_PROVINCE,
  type CofmPharmacy,
} from './cofm.parser';

const fixtureData: CofmPharmacy[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/cofm-response.json'), 'utf8'),
);

// ─── parseCofmCoordinates ─────────────────────────────────────────────────────

describe('parseCofmCoordinates', () => {
  it('parsea coordenadas válidas de Madrid', () => {
    expect(parseCofmCoordinates('40.42732577', '-3.70418625')).toEqual({
      lat: 40.42732577,
      lng: -3.70418625,
    });
  });

  it('retorna null si latitud no es número', () => {
    expect(parseCofmCoordinates('abc', '-3.70')).toBeNull();
  });

  it('retorna null si longitud no es número', () => {
    expect(parseCofmCoordinates('40.42', 'xyz')).toBeNull();
  });

  it('retorna null si latitud está fuera de rango', () => {
    expect(parseCofmCoordinates('91.0', '-3.70')).toBeNull();
  });

  it('retorna null si longitud está fuera de rango', () => {
    expect(parseCofmCoordinates('40.42', '-181.0')).toBeNull();
  });

  it('retorna null para strings vacíos', () => {
    expect(parseCofmCoordinates('', '')).toBeNull();
  });
});

// ─── parseCofmSchedule ────────────────────────────────────────────────────────

describe('parseCofmSchedule', () => {
  it('parsea un tramo horario simple', () => {
    expect(parseCofmSchedule('09:15-21:15')).toEqual([{ start: '09:15', end: '21:15' }]);
  });

  it('parsea múltiples tramos horarios', () => {
    expect(parseCofmSchedule('08:30-14:00,17:00-20:30')).toEqual([
      { start: '08:30', end: '14:00' },
      { start: '17:00', end: '20:30' },
    ]);
  });

  it('parsea horario 24h', () => {
    expect(parseCofmSchedule('00:00-23:59')).toEqual([{ start: '00:00', end: '23:59' }]);
  });

  it('retorna [] para string vacío', () => {
    expect(parseCofmSchedule('')).toEqual([]);
  });

  it('retorna [] para string undefined', () => {
    expect(parseCofmSchedule(undefined as unknown as string)).toEqual([]);
  });

  it('retorna [] para formato no reconocido', () => {
    expect(parseCofmSchedule('mañana y tarde')).toEqual([]);
  });

  it('retorna [] si algún segmento tiene formato inválido', () => {
    expect(parseCofmSchedule('09:00-14:00,tarde')).toEqual([]);
  });
});

// ─── buildCofmPharmacyName ────────────────────────────────────────────────────

describe('buildCofmPharmacyName', () => {
  it('genera nombre con dirección y población', () => {
    expect(buildCofmPharmacyName('PZ DOS DE MAYO, 6', 'MADRID')).toBe(
      'Farmacia PZ DOS DE MAYO, 6 - MADRID',
    );
  });

  it('genera nombre solo con dirección si población está vacía', () => {
    expect(buildCofmPharmacyName('CL ALCALA, 98', '')).toBe('Farmacia CL ALCALA, 98');
  });

  it('retorna "Farmacia desconocida" si dirección está vacía', () => {
    expect(buildCofmPharmacyName('', 'MADRID')).toBe('Farmacia desconocida');
  });
});

// ─── parseCofmResponse ────────────────────────────────────────────────────────

describe('parseCofmResponse', () => {
  const targetDate = new Date('2026-04-07T00:00:00Z');
  const url = 'https://www.cofm.es/rest/farmacias/es';

  it('solo incluye farmacias de guardia o 24h', () => {
    const result = parseCofmResponse(fixtureData, targetDate, url);
    // Del fixture: solo "100" tiene guardia=true y servicio24h=true
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Las 4 primeras (guardia=false, servicio24h=false) se descartan
    expect(result.every((s) => s.sourceUrl === url)).toBe(true);
  });

  it('parsea la farmacia de guardia 24h correctamente', () => {
    const result = parseCofmResponse(fixtureData, targetDate, url);
    const guardia = result.find((s) => s.pharmacy.address === 'AV GRAN VIA, 1');
    expect(guardia).toBeDefined();
    expect(guardia?.pharmacy.provinceName).toBe(COFM_PROVINCE);
    expect(guardia?.pharmacy.lat).toBeCloseTo(40.419);
    expect(guardia?.pharmacy.lng).toBeCloseTo(-3.701);
    expect(guardia?.startTime).toBe('00:00');
    expect(guardia?.endTime).toBe('23:59');
  });

  it('genera nombre con dirección y población', () => {
    const result = parseCofmResponse(fixtureData, targetDate, url);
    const guardia = result.find((s) => s.pharmacy.address === 'AV GRAN VIA, 1');
    expect(guardia?.pharmacy.name).toBe('Farmacia AV GRAN VIA, 1 - MADRID');
  });

  it('asigna el teléfono correcto', () => {
    const result = parseCofmResponse(fixtureData, targetDate, url);
    const guardia = result.find((s) => s.pharmacy.address === 'AV GRAN VIA, 1');
    expect(guardia?.pharmacy.phone).toBe('910000001');
  });

  it('crea múltiples schedules para farmacias con horario partido', () => {
    // Simulamos una farmacia de guardia con horario partido
    const data: CofmPharmacy[] = [
      {
        identificador: '999',
        direccion: 'CL TEST, 1',
        poblacion: 'MADRID',
        latitud: '40.42',
        longitud: '-3.70',
        telefono: '910000000',
        codigoPostal: '28001',
        horarioHoy: '09:00-14:00,17:00-21:00',
        horarioDesc: '09:00–14:00 · 17:00–21:00',
        abierta: true,
        guardia: true,
        servicio24h: false,
      },
    ];
    const result = parseCofmResponse(data, targetDate, url);
    expect(result).toHaveLength(2);
    expect(result[0].startTime).toBe('09:00');
    expect(result[0].endTime).toBe('14:00');
    expect(result[1].startTime).toBe('17:00');
    expect(result[1].endTime).toBe('21:00');
  });

  it('retorna [] si data es null', () => {
    expect(parseCofmResponse(null, targetDate, url)).toEqual([]);
  });

  it('retorna [] si data no es array', () => {
    expect(parseCofmResponse({ foo: 'bar' }, targetDate, url)).toEqual([]);
  });

  it('retorna [] si data es array vacío', () => {
    expect(parseCofmResponse([], targetDate, url)).toEqual([]);
  });

  it('omite items sin dirección', () => {
    const data: CofmPharmacy[] = [
      {
        identificador: '888',
        direccion: '',
        poblacion: 'MADRID',
        latitud: '40.42',
        longitud: '-3.70',
        telefono: '910000000',
        codigoPostal: '28001',
        horarioHoy: '09:00-21:00',
        horarioDesc: '09:00–21:00',
        abierta: true,
        guardia: true,
        servicio24h: false,
      },
    ];
    expect(parseCofmResponse(data, targetDate, url)).toEqual([]);
  });

  it('omite items con horario no parseable', () => {
    const data: CofmPharmacy[] = [
      {
        identificador: '777',
        direccion: 'CL TEST, 2',
        poblacion: 'MADRID',
        latitud: '40.42',
        longitud: '-3.70',
        telefono: '910000000',
        codigoPostal: '28001',
        horarioHoy: '',
        horarioDesc: '',
        abierta: true,
        guardia: true,
        servicio24h: false,
      },
    ];
    expect(parseCofmResponse(data, targetDate, url)).toEqual([]);
  });

  it('no lanza si la estructura es completamente inesperada', () => {
    expect(() => parseCofmResponse('cadena aleatoria', targetDate, url)).not.toThrow();
    expect(parseCofmResponse('cadena aleatoria', targetDate, url)).toEqual([]);
  });
});
