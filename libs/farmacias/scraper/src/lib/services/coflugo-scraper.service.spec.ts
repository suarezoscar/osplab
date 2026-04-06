import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@osplab/farmacias-data-access';
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

describe('CoflugoScraperService', () => {
  let service: CoflugoScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.province.upsert.mockResolvedValue({
      id: 'prov-1',
      name: 'Lugo',
      code: 'LU',
    });
    prisma.city.upsert.mockResolvedValue({
      id: 'city-1',
      name: 'Lugo',
      provinceId: 'prov-1',
    });
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

    service = new CoflugoScraperService(prisma as unknown as PrismaService);
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
    it('llama a axios.get por cada municipio y guarda turnos en BD', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureHtml });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // COFLUGO_MUNICIPIOS está mockeado a 2 entradas en este test file
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(prisma.dutySchedule.upsert).toHaveBeenCalled();
    });

    it('continúa con el resto si un municipio falla (fallo silencioso)', async () => {
      vi.spyOn(axios, 'get')
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue({ data: fixtureHtml });

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });

    it('no llama a prisma si el HTML no contiene .farmacias', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: '<html><body><p>Sin farmacias</p></body></html>',
      });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });
  });

  describe('upsertSchedules (via scrapeForDate)', () => {
    it('llama a $executeRaw cuando la farmacia tiene coordenadas', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: fixtureHtml });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
