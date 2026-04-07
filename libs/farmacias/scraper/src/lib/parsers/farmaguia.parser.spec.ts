import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  extractMagicKey,
  parseFarmaguiaCoordinates,
  parseFarmaguiaAddress,
  parseFarmaguiaSchedule,
  parseFarmaguiaResponse,
  buildFarmaguiaUrl,
  resolveProvinceFromPostalCode,
  FARMAGUIA_DATA_URL,
  FARMAGUIA_DEFAULT_PROVINCE,
  type FarmaguiaPharmacy,
} from './farmaguia.parser';

const fixtureData: FarmaguiaPharmacy[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/farmaguia-response.json'), 'utf8'),
);

// ─── extractMagicKey ──────────────────────────────────────────────────────────

describe('extractMagicKey', () => {
  it('extrae el hash del patrón estándar', () => {
    const js = 'LANGUAGE["MagicKey"] = "69d536abc123def456";';
    expect(extractMagicKey(js)).toBe('69d536abc123def456');
  });

  it('extrae el hash con espacios extra', () => {
    const js = 'LANGUAGE["MagicKey"]  =  "abc123" ;';
    expect(extractMagicKey(js)).toBe('abc123');
  });

  it('retorna null si no se encuentra el patrón', () => {
    expect(extractMagicKey('var x = 1;')).toBeNull();
  });

  it('retorna null para string vacío', () => {
    expect(extractMagicKey('')).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(extractMagicKey(undefined as unknown as string)).toBeNull();
  });
});

// ─── parseFarmaguiaCoordinates ────────────────────────────────────────────────

describe('parseFarmaguiaCoordinates', () => {
  it('parsea coordenadas válidas de Barcelona', () => {
    expect(parseFarmaguiaCoordinates('41.3873974', '2.168568')).toEqual({
      lat: 41.3873974,
      lng: 2.168568,
    });
  });

  it('retorna null si latitud no es número', () => {
    expect(parseFarmaguiaCoordinates('abc', '2.17')).toBeNull();
  });

  it('retorna null si latitud está fuera de rango', () => {
    expect(parseFarmaguiaCoordinates('91.0', '2.17')).toBeNull();
  });

  it('retorna null para strings vacíos', () => {
    expect(parseFarmaguiaCoordinates('', '')).toBeNull();
  });
});

// ─── parseFarmaguiaAddress ────────────────────────────────────────────────────

describe('parseFarmaguiaAddress', () => {
  it('parsea dirección con código postal y ciudad', () => {
    expect(parseFarmaguiaAddress('RB CATALUNYA,1  , 08007, BARCELONA')).toEqual({
      address: 'RB CATALUNYA,1',
      postalCode: '08007',
      city: 'BARCELONA',
    });
  });

  it('parsea dirección compleja con comas internas', () => {
    expect(parseFarmaguiaAddress(' POTOSÍ, LOCAL C 25,2  , 08030, BARCELONA')).toEqual({
      address: 'POTOSÍ, LOCAL C 25,2',
      postalCode: '08030',
      city: 'BARCELONA',
    });
  });

  it('parsea dirección de otra ciudad', () => {
    expect(parseFarmaguiaAddress('CL MAJOR, 15  , 08820, EL PRAT DE LLOBREGAT')).toEqual({
      address: 'CL MAJOR, 15',
      postalCode: '08820',
      city: 'EL PRAT DE LLOBREGAT',
    });
  });

  it('parsea dirección de Girona', () => {
    expect(parseFarmaguiaAddress('CL SANTA CLARA, 20  , 17001, GIRONA')).toEqual({
      address: 'CL SANTA CLARA, 20',
      postalCode: '17001',
      city: 'GIRONA',
    });
  });

  it('parsea dirección de Lleida', () => {
    expect(parseFarmaguiaAddress('AV BLONDEL, 42  , 25002, LLEIDA')).toEqual({
      address: 'AV BLONDEL, 42',
      postalCode: '25002',
      city: 'LLEIDA',
    });
  });

  it('parsea dirección de Tarragona', () => {
    expect(parseFarmaguiaAddress('RB NOVA, 8  , 43001, TARRAGONA')).toEqual({
      address: 'RB NOVA, 8',
      postalCode: '43001',
      city: 'TARRAGONA',
    });
  });

  it('retorna null para string vacío', () => {
    expect(parseFarmaguiaAddress('')).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(parseFarmaguiaAddress(undefined as unknown as string)).toBeNull();
  });

  it('usa fallback si no coincide el patrón postal', () => {
    const result = parseFarmaguiaAddress('DIRECCIÓN SIN FORMATO');
    expect(result).toEqual({
      address: 'DIRECCIÓN SIN FORMATO',
      postalCode: null,
      city: FARMAGUIA_DEFAULT_PROVINCE.name,
    });
  });
});

// ─── parseFarmaguiaSchedule ───────────────────────────────────────────────────

describe('parseFarmaguiaSchedule', () => {
  it('parsea un tramo horario simple', () => {
    expect(parseFarmaguiaSchedule(' 09:00-22:00')).toEqual([{ start: '09:00', end: '22:00' }]);
  });

  it('parsea múltiples tramos separados por espacio', () => {
    expect(parseFarmaguiaSchedule(' 08:00-14:00 17:00-22:00')).toEqual([
      { start: '08:00', end: '14:00' },
      { start: '17:00', end: '22:00' },
    ]);
  });

  it('parsea horario 24h', () => {
    expect(parseFarmaguiaSchedule(' 00:00-23:59')).toEqual([{ start: '00:00', end: '23:59' }]);
  });

  it('retorna [] para string vacío', () => {
    expect(parseFarmaguiaSchedule('')).toEqual([]);
  });

  it('retorna [] para undefined', () => {
    expect(parseFarmaguiaSchedule(undefined as unknown as string)).toEqual([]);
  });

  it('retorna [] para formato no reconocido', () => {
    expect(parseFarmaguiaSchedule('horari desconegut')).toEqual([]);
  });
});

// ─── buildFarmaguiaUrl ────────────────────────────────────────────────────────

describe('buildFarmaguiaUrl', () => {
  it('incluye la URL base', () => {
    const url = buildFarmaguiaUrl('testkey123');
    expect(url).toContain(FARMAGUIA_DATA_URL);
  });

  it('incluye el MagicKey', () => {
    const url = buildFarmaguiaUrl('testkey123');
    expect(url).toContain('mk=testkey123');
  });

  it('incluye t=1 para obtener todas las farmacias', () => {
    const url = buildFarmaguiaUrl('testkey123');
    expect(url).toContain('t=1');
  });

  it('incluye las coordenadas del centro de Barcelona', () => {
    const url = buildFarmaguiaUrl('testkey123');
    expect(url).toContain('lat=41.3888');
    expect(url).toContain('lon=2.159');
  });

  it('incluye fecha/hora cuando se proporciona date', () => {
    const url = buildFarmaguiaUrl('testkey123', new Date('2026-04-10T22:00:00+02:00'));
    expect(url).toContain('h=2026-04-10%2022%3A00');
  });

  it('omite h cuando no se proporciona date', () => {
    const url = buildFarmaguiaUrl('testkey123');
    expect(url).not.toContain('h=');
  });
});

// ─── resolveProvinceFromPostalCode ────────────────────────────────────────────

describe('resolveProvinceFromPostalCode', () => {
  it('resuelve Barcelona para código postal 08xxx', () => {
    expect(resolveProvinceFromPostalCode('08007')).toEqual({ name: 'Barcelona', code: 'B' });
  });

  it('resuelve Gerona para código postal 17xxx', () => {
    expect(resolveProvinceFromPostalCode('17001')).toEqual({ name: 'Gerona', code: 'GI' });
  });

  it('resuelve Lérida para código postal 25xxx', () => {
    expect(resolveProvinceFromPostalCode('25002')).toEqual({ name: 'Lérida', code: 'L' });
  });

  it('resuelve Tarragona para código postal 43xxx', () => {
    expect(resolveProvinceFromPostalCode('43001')).toEqual({ name: 'Tarragona', code: 'T' });
  });

  it('retorna default para código postal desconocido', () => {
    expect(resolveProvinceFromPostalCode('28001')).toEqual(FARMAGUIA_DEFAULT_PROVINCE);
  });

  it('retorna default para null', () => {
    expect(resolveProvinceFromPostalCode(null)).toEqual(FARMAGUIA_DEFAULT_PROVINCE);
  });

  it('retorna default para string vacío', () => {
    expect(resolveProvinceFromPostalCode('')).toEqual(FARMAGUIA_DEFAULT_PROVINCE);
  });
});

// ─── parseFarmaguiaResponse ───────────────────────────────────────────────────

describe('parseFarmaguiaResponse', () => {
  const targetDate = new Date('2026-04-10T00:00:00Z');
  const url = 'https://www.farmaguia.net/desktop/data.html?test';

  it('solo incluye farmacias de guardia (Guardia === "1")', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    // Fixture: 516, 900, 201 (Barcelona), 301 (Girona), 401 (Lleida), 501 (Tarragona) tienen Guardia="1"
    // 606 tiene Guardia=null; 999 tiene Guardia="1" pero sin datos
    // 201 tiene horario partido → 2 schedules
    expect(result.length).toBeGreaterThanOrEqual(7);
  });

  it('descarta farmacias sin guardia (Guardia=null)', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const ids = result.map((s) => s.pharmacy.name);
    expect(ids.every((n) => !n.includes('ORTI BRAVO'))).toBe(true);
  });

  it('parsea nombre como "Farmacia " + Nom', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const espona = result.find((s) => s.pharmacy.name.includes('ESPONA'));
    expect(espona?.pharmacy.name).toBe('Farmacia N. ESPONA MESEGUER');
  });

  it('parsea la ciudad correctamente desde Adreca', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const espona = result.find((s) => s.pharmacy.name.includes('ESPONA'));
    expect(espona?.pharmacy.cityName).toBe('BARCELONA');
  });

  it('parsea ciudades distintas de Barcelona', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const puig = result.find((s) => s.pharmacy.name.includes('PUIG'));
    expect(puig?.pharmacy.cityName).toBe('EL PRAT DE LLOBREGAT');
  });

  it('asigna provinceName = Barcelona para código postal 08xxx', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const espona = result.find((s) => s.pharmacy.name.includes('ESPONA'));
    expect(espona?.pharmacy.provinceName).toBe('Barcelona');
  });

  it('asigna provinceName = Gerona para código postal 17xxx', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const ferrer = result.find((s) => s.pharmacy.name.includes('FERRER'));
    expect(ferrer?.pharmacy.provinceName).toBe('Gerona');
  });

  it('asigna provinceName = Lérida para código postal 25xxx', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const vidal = result.find((s) => s.pharmacy.name.includes('VIDAL'));
    expect(vidal?.pharmacy.provinceName).toBe('Lérida');
  });

  it('asigna provinceName = Tarragona para código postal 43xxx', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const sanchez = result.find((s) => s.pharmacy.name.includes('SANCHEZ'));
    expect(sanchez?.pharmacy.provinceName).toBe('Tarragona');
  });

  it('contiene farmacias de las 4 provincias catalanas', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const provinces = new Set(result.map((s) => s.pharmacy.provinceName));
    expect(provinces).toEqual(new Set(['Barcelona', 'Gerona', 'Lérida', 'Tarragona']));
  });

  it('parsea coordenadas correctamente', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const espona = result.find((s) => s.pharmacy.name.includes('ESPONA'));
    expect(espona?.pharmacy.lat).toBeCloseTo(41.3875);
    expect(espona?.pharmacy.lng).toBeCloseTo(2.168);
  });

  it('parsea el horario correctamente', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const espona = result.find((s) => s.pharmacy.name.includes('ESPONA'));
    expect(espona?.startTime).toBe('09:00');
    expect(espona?.endTime).toBe('21:00');
  });

  it('crea múltiples schedules para horario partido', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const puigSchedules = result.filter((s) => s.pharmacy.name.includes('PUIG'));
    expect(puigSchedules).toHaveLength(2);
    expect(puigSchedules[0].startTime).toBe('08:00');
    expect(puigSchedules[0].endTime).toBe('14:00');
    expect(puigSchedules[1].startTime).toBe('17:00');
    expect(puigSchedules[1].endTime).toBe('22:00');
  });

  it('omite items con dirección vacía y sin horario', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    const empty = result.filter((s) => s.pharmacy.name.includes('999'));
    expect(empty).toHaveLength(0);
  });

  it('retorna [] si data es null', () => {
    expect(parseFarmaguiaResponse(null, targetDate, url)).toEqual([]);
  });

  it('retorna [] si data no es array ni objeto con farmacias', () => {
    expect(parseFarmaguiaResponse({ foo: 'bar' }, targetDate, url)).toEqual([]);
  });

  it('acepta formato wrapper { farmacias: [...] }', () => {
    const wrapped = { farmacias: fixtureData, hospitales: [], caps: [], anuncios: [] };
    const result = parseFarmaguiaResponse(wrapped, targetDate, url);
    expect(result.length).toBeGreaterThanOrEqual(7);
    const provinces = new Set(result.map((s) => s.pharmacy.provinceName));
    expect(provinces).toEqual(new Set(['Barcelona', 'Gerona', 'Lérida', 'Tarragona']));
  });

  it('acepta array directo como fallback', () => {
    const result = parseFarmaguiaResponse(fixtureData, targetDate, url);
    expect(result.length).toBeGreaterThanOrEqual(7);
  });

  it('retorna [] si data es array vacío', () => {
    expect(parseFarmaguiaResponse([], targetDate, url)).toEqual([]);
  });

  it('no lanza si la estructura es completamente inesperada', () => {
    expect(() => parseFarmaguiaResponse('cadena', targetDate, url)).not.toThrow();
    expect(parseFarmaguiaResponse('cadena', targetDate, url)).toEqual([]);
  });
});
