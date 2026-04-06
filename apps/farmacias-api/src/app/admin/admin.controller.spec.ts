import { vi, type Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import { CofourenseScraperService } from '@osplab/farmacias-scraper';
import { CofpontevedraScraperService } from '@osplab/farmacias-scraper';
import { CoflugoScraperService } from '@osplab/farmacias-scraper';
import { CofcScraperService } from '@osplab/farmacias-scraper';

const mockCofourense: Partial<CofourenseScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

const mockCofpontevedra: Partial<CofpontevedraScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

const mockCoflugo: Partial<CoflugoScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

const mockCofc: Partial<CofcScraperService> = {
  scrapeToday: vi.fn().mockResolvedValue(undefined),
};

/** Crea la app con el guard sobreescrito (para tests de lógica del controller) */
async function buildApp(overrideGuard = true): Promise<INestApplication> {
  let builder = Test.createTestingModule({
    controllers: [AdminController],
    providers: [
      { provide: CofourenseScraperService, useValue: mockCofourense },
      { provide: CofpontevedraScraperService, useValue: mockCofpontevedra },
      { provide: CoflugoScraperService, useValue: mockCoflugo },
      { provide: CofcScraperService, useValue: mockCofc },
    ],
  });

  if (overrideGuard) {
    builder = builder.overrideGuard(AdminApiKeyGuard).useValue({ canActivate: () => true });
  }

  const module: TestingModule = await builder.compile();
  const app = module.createNestApplication();
  await app.init();
  return app;
}

describe('AdminController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await buildApp();
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

  describe('POST /admin/scrape/coflugo', () => {
    it('responde 202 Accepted', async () => {
      const res = await request(app.getHttpServer()).post('/admin/scrape/coflugo');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
      expect(res.body.message).toContain('Lugo');
    });

    it('invoca scrapeToday en background', async () => {
      await request(app.getHttpServer()).post('/admin/scrape/coflugo');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockCoflugo.scrapeToday).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /admin/scrape/cofc', () => {
    it('responde 202 Accepted', async () => {
      const res = await request(app.getHttpServer()).post('/admin/scrape/cofc');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
      expect(res.body.message).toContain('Coruña');
    });

    it('invoca scrapeToday en background', async () => {
      await request(app.getHttpServer()).post('/admin/scrape/cofc');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockCofc.scrapeToday).toHaveBeenCalledTimes(1);
    });

    it('no propaga el error si scrapeToday rechaza', async () => {
      (mockCofc.scrapeToday as Mock).mockRejectedValueOnce(new Error('scraping failed'));

      const res = await request(app.getHttpServer()).post('/admin/scrape/cofc');

      expect(res.status).toBe(HttpStatus.ACCEPTED);
    });
  });
});

describe('AdminApiKeyGuard', () => {
  const VALID_KEY = 'test-secret-key-32-chars-minimum!!';
  let app: INestApplication;

  beforeEach(async () => {
    process.env['ADMIN_API_KEY'] = VALID_KEY;
    app = await buildApp(false); // sin override: guard real
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
    delete process.env['ADMIN_API_KEY'];
  });

  it('devuelve 401 sin cabecera X-Admin-Key', async () => {
    const res = await request(app.getHttpServer()).post('/admin/scrape/cofourense');
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('devuelve 401 con API key incorrecta', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/scrape/cofourense')
      .set('X-Admin-Key', 'wrong-key');
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('devuelve 202 con la API key correcta', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/scrape/cofourense')
      .set('X-Admin-Key', VALID_KEY);
    expect(res.status).toBe(HttpStatus.ACCEPTED);
  });

  it('devuelve 401 si ADMIN_API_KEY no está configurada', async () => {
    delete process.env['ADMIN_API_KEY'];
    const res = await request(app.getHttpServer())
      .post('/admin/scrape/cofourense')
      .set('X-Admin-Key', VALID_KEY);
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
