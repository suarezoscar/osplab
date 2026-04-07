import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import { CofourenseScraperService } from './cofourense-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixtureData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/cofourense-response.json'), 'utf8'),
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
    upsertSchedules: vi.fn().mockResolvedValue({ saved: 3, skipped: 0 }),
  };
}

describe('CofourenseScraperService', () => {
  let service: CofourenseScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new CofourenseScraperService(
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
    it('guarda schedules correctamente con fixture válido', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureData });

      await service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00'));

      expect(writer.upsertSchedules).toHaveBeenCalledTimes(1);
      expect(writer.upsertSchedules).toHaveBeenCalledWith(
        { name: 'Ourense', code: 'OR' },
        expect.arrayContaining([expect.objectContaining({ pharmacy: expect.any(Object) })]),
      );
    });

    it('no guarda nada si informacion está vacío (API cambiada)', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { informacion: [], metadatos: { paginacion: { totalElementos: 0 } } },
      });

      await service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(
        service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00')),
      ).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });
  });
});
