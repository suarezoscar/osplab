import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';

const mockService: Partial<PharmaciesService> = {
  findNearest: vi.fn().mockResolvedValue([
    {
      id: 'ph-1',
      name: 'Farmacia Test',
      address: 'Calle Test, 1',
      phone: '986000000',
      city: 'Pontevedra',
      province: 'Pontevedra',
      distance: 200,
      startTime: '09:00',
      endTime: '22:00',
      lat: 42.43,
      lng: -8.64,
    },
  ]),
};

describe('PharmaciesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmaciesController],
      providers: [{ provide: PharmaciesService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe('GET /pharmacies/nearest', () => {
    it('200 con lat y lng válidos', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: '42.43', lng: '-8.64' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Farmacia Test');
    });

    it('400 sin lat ni lng', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest');

      expect(res.status).toBe(400);
    });

    it('400 con lat fuera de rango (>90)', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: '999', lng: '0' });

      expect(res.status).toBe(400);
    });

    it('400 con lng fuera de rango (<-180)', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: '42', lng: '-200' });

      expect(res.status).toBe(400);
    });

    it('400 con valores no numéricos', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: 'abc', lng: 'xyz' });

      expect(res.status).toBe(400);
    });

    it('200 con parámetro date opcional', async () => {
      const res = await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: '42.43', lng: '-8.64', date: '2026-04-10' });

      expect(res.status).toBe(200);
    });

    it('transforma strings a números antes de llamar al servicio', async () => {
      await request(app.getHttpServer())
        .get('/pharmacies/nearest')
        .query({ lat: '42.43', lng: '-8.64' });

      expect(mockService.findNearest).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 42.43, lng: -8.64 }),
      );
    });
  });
});

