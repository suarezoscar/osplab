import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
import { CofmScraperService } from './cofm-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixtureData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/cofm-response.json'), 'utf8'),
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
    upsertSchedules: vi.fn().mockResolvedValue({ saved: 1, skipped: 0 }),
  };
}

describe('CofmScraperService', () => {
  let service: CofmScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new CofmScraperService(
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

      await service.scrapeForDate(new Date('2026-04-07T00:00:00Z'));

      expect(writer.upsertSchedules).toHaveBeenCalledTimes(1);
      expect(writer.upsertSchedules).toHaveBeenCalledWith(
        { name: 'Madrid', code: 'M' },
        expect.arrayContaining([expect.objectContaining({ pharmacy: expect.any(Object) })]),
      );
    });

    it('no guarda nada si no hay farmacias de guardia', async () => {
      // Fixture sin guardia=true ni servicio24h=true → las 4 primeras
      const noGuardiaData = fixtureData.filter(
        (p: { guardia: boolean; servicio24h: boolean }) => !p.guardia && !p.servicio24h,
      );
      vi.spyOn(axios, 'get').mockResolvedValue({ data: noGuardiaData });

      await service.scrapeForDate(new Date('2026-04-07T00:00:00Z'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('no guarda nada si la respuesta es un array vacío', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });

      await service.scrapeForDate(new Date('2026-04-07T00:00:00Z'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(service.scrapeForDate(new Date('2026-04-07T00:00:00Z'))).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });
  });
});
