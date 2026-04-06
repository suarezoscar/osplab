import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import { CofourenseScraperService } from './cofourense-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixtureData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/cofourense-response.json'), 'utf8'),
);

type PrismaMock = {
  province: { upsert: Mock };
  city: { upsert: Mock };
  pharmacy: { upsert: Mock; findFirst: Mock };
  dutySchedule: { upsert: Mock; deleteMany: Mock };
  $executeRaw: Mock;
};

function makePrismaMock(): PrismaMock {
  return {
    province: { upsert: vi.fn() },
    city: { upsert: vi.fn() },
    pharmacy: { upsert: vi.fn(), findFirst: vi.fn() },
    dutySchedule: { upsert: vi.fn(), deleteMany: vi.fn() },
    $executeRaw: vi.fn(),
  };
}

describe('CofourenseScraperService', () => {
  let service: CofourenseScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.province.upsert.mockResolvedValue({ id: 'prov-1', name: 'Ourense', code: 'OR' });
    prisma.city.upsert.mockResolvedValue({ id: 'city-1', name: 'Ourense', provinceId: 'prov-1' });
    prisma.pharmacy.findFirst.mockResolvedValue(null);
    prisma.pharmacy.upsert.mockResolvedValue({
      id: 'ph-1',
      name: 'Test',
      address: 'Test',
      phone: null,
      cityId: 'city-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.dutySchedule.upsert.mockResolvedValue({
      id: 'ds-1',
      pharmacyId: 'ph-1',
      date: new Date(),
      startTime: '09:00',
      endTime: '22:00',
      type: 'REGULAR',
      source: null,
      createdAt: new Date(),
    });
    prisma.dutySchedule.deleteMany.mockResolvedValue({ count: 0 });
    prisma.$executeRaw.mockResolvedValue(1);

    service = new CofourenseScraperService(prisma as unknown as PrismaService);
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

      expect(prisma.dutySchedule.upsert).toHaveBeenCalledTimes(2);
    });

    it('no guarda nada si informacion está vacío (API cambiada)', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { informacion: [], metadatos: { paginacion: { totalElementos: 0 } } },
      });

      await service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00'));

      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });

    it('falla silenciosamente en error de red', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(
        service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00')),
      ).resolves.not.toThrow();
      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });
  });

  describe('findPharmacyId (indirecto via upsertSchedules)', () => {
    it('usa create (id "new") cuando la farmacia no existe en BD', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureData });
      prisma.pharmacy.findFirst.mockResolvedValue(null);

      await service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00'));

      expect(prisma.pharmacy.upsert.mock.calls.some((c) => c[0].where.id === 'new')).toBe(true);
    });

    it('usa update cuando la farmacia ya existe en BD', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureData });
      prisma.pharmacy.findFirst.mockResolvedValue({ id: 'existing-id' });

      await service.scrapeForDate(new Date('2026-04-06T10:00:00'), new Date('2026-04-06T00:00:00'));

      expect(prisma.pharmacy.upsert.mock.calls.some((c) => c[0].where.id === 'existing-id')).toBe(
        true,
      );
    });
  });
});
