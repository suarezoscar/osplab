import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import { FarmaguiaScraperService } from './farmaguia-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixtureData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/farmaguia-response.json'), 'utf8'),
);

const FAKE_LANG_JS = `
  LANGUAGE["MagicKey"] = "abc123testkey";
  LANGUAGE["Close"] = "Tancar";
`;

type PrismaMock = {
  dutySchedule: { deleteMany: Mock };
};

function makePrismaMock(): PrismaMock {
  return {
    dutySchedule: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
  };
}

function makeWriterMock() {
  return {
    upsertSchedules: vi.fn().mockResolvedValue({ saved: 3, skipped: 0 }),
  };
}

describe('FarmaguiaScraperService', () => {
  let service: FarmaguiaScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new FarmaguiaScraperService(
      prisma as unknown as PrismaService,
      writer as unknown as ScheduleWriterService,
    );
    vi.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeForDate', () => {
    it('guarda schedules agrupados por las 4 provincias catalanas', async () => {
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: '<html></html>',
          headers: { 'set-cookie': ['PHPSESSID=abc123'] },
        }) // index.html
        .mockResolvedValueOnce({ data: FAKE_LANG_JS, headers: {} }) // lang.js
        .mockResolvedValueOnce({ data: { farmacias: fixtureData } }); // data.html

      await service.scrapeForDate(new Date('2026-04-10T00:00:00Z'));

      // Fixture tiene farmacias de 4 provincias → upsertSchedules se llama 4 veces
      expect(writer.upsertSchedules).toHaveBeenCalledTimes(4);

      const calls = writer.upsertSchedules.mock.calls;
      const calledProvinces = calls.map((c: unknown[]) => (c[0] as { name: string }).name).sort();
      expect(calledProvinces).toEqual(['Barcelona', 'Gerona', 'Lérida', 'Tarragona']);
    });

    it('usa el código de provincia correcto para cada provincia', async () => {
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: '<html></html>',
          headers: { 'set-cookie': ['PHPSESSID=abc123'] },
        })
        .mockResolvedValueOnce({ data: FAKE_LANG_JS, headers: {} })
        .mockResolvedValueOnce({ data: { farmacias: fixtureData } });

      await service.scrapeForDate(new Date('2026-04-10T00:00:00Z'));

      const calls = writer.upsertSchedules.mock.calls;
      const provinceRefs = calls.map((c: unknown[]) => c[0] as { name: string; code: string });

      expect(provinceRefs).toEqual(
        expect.arrayContaining([
          { name: 'Barcelona', code: 'B' },
          { name: 'Gerona', code: 'GI' },
          { name: 'Lérida', code: 'L' },
          { name: 'Tarragona', code: 'T' },
        ]),
      );
    });

    it('no guarda nada si MagicKey no se encuentra', async () => {
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: '<html></html>', headers: {} }) // index.html
        .mockResolvedValueOnce({ data: 'var x = 1;', headers: {} }); // lang.js sin MagicKey

      await service.scrapeForDate(new Date('2026-04-10T00:00:00Z'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('no guarda nada si no hay farmacias de guardia', async () => {
      const noGuardiaData = fixtureData.filter(
        (p: { Guardia: string | null }) => p.Guardia !== '1',
      );
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: '<html></html>', headers: {} }) // index.html
        .mockResolvedValueOnce({ data: FAKE_LANG_JS, headers: {} }) // lang.js
        .mockResolvedValueOnce({ data: { farmacias: noGuardiaData } }); // data.html

      await service.scrapeForDate(new Date('2026-04-10T00:00:00Z'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red (index.html)', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.scrapeForDate(new Date('2026-04-10T00:00:00Z'))).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red (lang.js)', async () => {
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: '<html></html>', headers: {} }) // index.html
        .mockRejectedValueOnce(new Error('Network Error')); // lang.js

      await expect(service.scrapeForDate(new Date('2026-04-10T00:00:00Z'))).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red (data.html)', async () => {
      vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: '<html></html>', headers: {} }) // index.html
        .mockResolvedValueOnce({ data: FAKE_LANG_JS, headers: {} }) // lang.js
        .mockRejectedValueOnce(new Error('Network Error')); // data.html

      await expect(service.scrapeForDate(new Date('2026-04-10T00:00:00Z'))).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });
  });
});
