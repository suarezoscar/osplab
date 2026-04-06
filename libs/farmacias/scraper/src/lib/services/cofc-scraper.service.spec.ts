import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@osplab/farmacias-data-access';
import { CofcScraperService } from './cofc-scraper.service';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Limitar COFC_MUNICIPIOS a 1 entrada para tests más rápidos
vi.mock('../parsers/cofc.parser', async (importOriginal) => {
  const original = await importOriginal<typeof import('../parsers/cofc.parser')>();
  return {
    ...original,
    COFC_MUNICIPIOS: [{ id: 2137, nombre: 'A Coruña' }],
  };
});

const fixtureData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsers/__fixtures__/cofc-response.json'), 'utf8'),
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

describe('CofcScraperService', () => {
  let service: CofcScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.province.upsert.mockResolvedValue({
      id: 'prov-1',
      name: 'A Coruña',
      code: 'CO',
    });
    prisma.city.upsert.mockResolvedValue({
      id: 'city-1',
      name: 'A Coruña',
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
      startTime: '09:30',
      endTime: '22:00',
      type: 'REGULAR',
      source: null,
      createdAt: new Date(),
    });
    prisma.dutySchedule.deleteMany.mockResolvedValue({ count: 0 });
    prisma.$executeRaw.mockResolvedValue(1);

    service = new CofcScraperService(prisma as unknown as PrismaService);
    vi.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeForDate', () => {
    const mockSessionHtml =
      '<html><body><input name="__RequestVerificationToken" type="hidden" value="test-token-abc" /></body></html>';

    it('llama a axios.post para cada municipio y guarda turnos en BD', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: mockSessionHtml,
        headers: { 'set-cookie': ['.AspNetCore.Antiforgery=cookie-val; Path=/'] },
      });
      vi.spyOn(axios, 'post').mockResolvedValue({ data: fixtureData });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('cofc.es'),
        expect.stringContaining('IdPoblacionFiltro=2137'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Requested-With': 'XMLHttpRequest' }),
        }),
      );
      expect(prisma.dutySchedule.upsert).toHaveBeenCalled();
    });

    it('cancela si fetchSession falla', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('timeout'));

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });

    it('continúa si un municipio falla (fallo silencioso)', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: mockSessionHtml,
        headers: { 'set-cookie': ['.AspNetCore.Antiforgery=cookie-val; Path=/'] },
      });
      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('timeout'));

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });

    it('no llama a prisma si la respuesta no tiene farmacias', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: mockSessionHtml,
        headers: { 'set-cookie': ['.AspNetCore.Antiforgery=cookie-val; Path=/'] },
      });
      vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          formulario: '<div>Sin resultados</div>',
          listadoTodas: [],
          nombrePoblacion: 'A Coruña',
          esBusquedaGuardias: true,
        },
      });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(prisma.dutySchedule.upsert).not.toHaveBeenCalled();
    });
  });

  describe('upsertSchedules (via scrapeForDate)', () => {
    it('llama a $executeRaw cuando la farmacia tiene coordenadas', async () => {
      const mockSessionHtml =
        '<html><body><input name="__RequestVerificationToken" type="hidden" value="test-token-abc" /></body></html>';
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: mockSessionHtml,
        headers: { 'set-cookie': ['.AspNetCore.Antiforgery=cookie-val; Path=/'] },
      });
      vi.spyOn(axios, 'post').mockResolvedValue({ data: fixtureData });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
