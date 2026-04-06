import { vi, type Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { CofourenseScraperService } from '@farmacias-guardia/api-scraper';
import { CofpontevedraScraperService } from '@farmacias-guardia/api-scraper';

const mockCofourense: Partial<CofourenseScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

const mockCofpontevedra: Partial<CofpontevedraScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

describe('AdminController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: CofourenseScraperService, useValue: mockCofourense },
        { provide: CofpontevedraScraperService, useValue: mockCofpontevedra },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe('POST /admin/scrape/cofourense', () => {
    it('responde 202 Accepted', async () => {
      const res = await request(app.getHttpServer()).post('/admin/scrape/cofourense');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
      expect(res.body.message).toContain('Ourense');
    });

    it('invoca scrapeToday en background', async () => {
      await request(app.getHttpServer()).post('/admin/scrape/cofourense');
      // fire-and-forget: puede no haberse ejecutado aún; verificamos que se llamó
      await new Promise((r) => setTimeout(r, 10));
      expect(mockCofourense.scrapeToday).toHaveBeenCalledTimes(1);
    });

    it('no propaga el error si scrapeToday rechaza', async () => {
      (mockCofourense.scrapeToday as Mock).mockRejectedValueOnce(new Error('scraping failed'));

      const res = await request(app.getHttpServer()).post('/admin/scrape/cofourense');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
    });
  });

  describe('POST /admin/scrape/cofpontevedra', () => {
    it('responde 202 Accepted', async () => {
      const res = await request(app.getHttpServer()).post('/admin/scrape/cofpontevedra');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
      expect(res.body.message).toContain('Pontevedra');
    });

    it('invoca scrapeToday en background', async () => {
      await request(app.getHttpServer()).post('/admin/scrape/cofpontevedra');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockCofpontevedra.scrapeToday).toHaveBeenCalledTimes(1);
    });
  });
});
