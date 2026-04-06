import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import { CofpontevedraScraperService } from './cofpontevedra-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

const fixtureItems = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/cofpontevedra-items.json'), 'utf8'),
);

const mockMunicipios = [
  { id: '36038', nombre: 'Pontevedra', provincia: 'Pontevedra', pais: 'España' },
  { id: '36057', nombre: 'Vigo', provincia: 'Pontevedra', pais: 'España' },
];

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

describe('CofpontevedraScraperService', () => {
  let service: CofpontevedraScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.province.upsert.mockResolvedValue({ id: 'prov-1', name: 'Pontevedra', code: 'PO' });
    prisma.city.upsert.mockResolvedValue({
      id: 'city-1',
      name: 'Pontevedra',
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

    service = new CofpontevedraScraperService(prisma as unknown as PrismaService);
    vi.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeForDate', () => {
    it('no itera municipios si fetchMunicipios falla', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('timeout'));

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });

    it('llama a axios.post por cada municipio', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: fixtureItems });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // 1 (municipios) + 2 (uno por municipio)
      expect(axios.post).toHaveBeenCalledTimes(3);
    });

    it('Diurno+Nocturno del mismo id genera un único dutySchedule.upsert', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: fixtureItems });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // id 101 (Diurno+Nocturno=1) + id 202 (Diurno=1) × 2 municipios = 4 upserts
      expect(prisma.dutySchedule.upsert).toHaveBeenCalledTimes(4);
    });

    it('falla silenciosamente si la respuesta de un municipio es inválida', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: 'html inesperado' });

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });
  });
});
