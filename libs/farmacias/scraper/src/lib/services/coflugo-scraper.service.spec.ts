import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import { CoflugoScraperService } from './coflugo-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Reducir COFLUGO_MUNICIPIOS a 2 entradas para evitar sleep acumulado (64×200ms = 12.8s)
vi.mock('../parsers/coflugo.parser', async (importOriginal) => {
  const original = await importOriginal<typeof import('../parsers/coflugo.parser')>();
  return {
    ...original,
    COFLUGO_MUNICIPIOS: [
      { id: 122, nombre: 'Lugo' },
      { id: 95, nombre: 'Abadín' },
    ],
  };
});

const fixtureHtml = fs.readFileSync(
  path.join(__dirname, '../parsers/__fixtures__/coflugo.html'),
  'utf8',
);

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
    upsertSchedules: vi.fn().mockResolvedValue({ saved: 2, skipped: 0 }),
  };
}

describe('CoflugoScraperService', () => {
  let service: CoflugoScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new CoflugoScraperService(
      prisma as unknown as PrismaService,
      writer as unknown as ScheduleWriterService,
    );
    // Silenciar logs del servicio en tests
    vi.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeForDate', () => {
    it('llama a axios.get por cada municipio y delega persistencia al writer', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureHtml });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // COFLUGO_MUNICIPIOS está mockeado a 2 entradas en este test file
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(writer.upsertSchedules).toHaveBeenCalled();
      expect(writer.upsertSchedules).toHaveBeenCalledWith(
        { name: 'Lugo', code: 'LU' },
        expect.any(Array),
      );
    });

    it('continúa con el resto si un municipio falla (fallo silencioso)', async () => {
      vi.spyOn(axios, 'get')
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue({ data: fixtureHtml });

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });

    it('no llama al writer si el HTML no contiene .farmacias', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: '<html><body><p>Sin farmacias</p></body></html>',
      });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });
  });
});
