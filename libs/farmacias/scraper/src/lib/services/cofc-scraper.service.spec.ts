import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
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

describe('CofcScraperService', () => {
  let service: CofcScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new CofcScraperService(
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
    const mockSessionHtml =
      '<html><body><input name="__RequestVerificationToken" type="hidden" value="test-token-abc" /></body></html>';

    it('llama a axios.post para cada municipio y delega persistencia al writer', async () => {
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
      expect(writer.upsertSchedules).toHaveBeenCalled();
      expect(writer.upsertSchedules).toHaveBeenCalledWith(
        { name: 'A Coruña', code: 'CO' },
        expect.any(Array),
      );
    });

    it('cancela si fetchSession falla', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('timeout'));

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('continúa si un municipio falla (fallo silencioso)', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: mockSessionHtml,
        headers: { 'set-cookie': ['.AspNetCore.Antiforgery=cookie-val; Path=/'] },
      });
      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('timeout'));

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });

    it('no llama al writer si la respuesta no tiene farmacias', async () => {
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

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });
  });
});
