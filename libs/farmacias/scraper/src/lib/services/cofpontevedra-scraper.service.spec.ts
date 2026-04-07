import { vi, type Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService, ScheduleWriterService } from '@osplab/farmacias-data-access';
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

describe('CofpontevedraScraperService', () => {
  let service: CofpontevedraScraperService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let writer: ReturnType<typeof makeWriterMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    writer = makeWriterMock();

    service = new CofpontevedraScraperService(
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
    it('no itera municipios si fetchMunicipios falla', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('timeout'));

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      expect(writer.upsertSchedules).not.toHaveBeenCalled();
    });

    it('llama a axios.post por cada municipio', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: fixtureItems });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // 1 (municipios) + 2 (uno por municipio)
      expect(axios.post).toHaveBeenCalledTimes(3);
    });

    it('delega la persistencia al ScheduleWriterService', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: fixtureItems });

      await service.scrapeForDate(new Date('2026-04-06T00:00:00'));

      // Se llama una vez por cada municipio que devuelve schedules
      expect(writer.upsertSchedules).toHaveBeenCalled();
      expect(writer.upsertSchedules).toHaveBeenCalledWith(
        { name: 'Pontevedra', code: 'PO' },
        expect.any(Array),
      );
    });

    it('falla silenciosamente si la respuesta de un municipio es inválida', async () => {
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockMunicipios })
        .mockResolvedValue({ data: 'html inesperado' });

      await expect(service.scrapeForDate(new Date('2026-04-06T00:00:00'))).resolves.not.toThrow();
    });
  });
});
