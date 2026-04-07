import { vi, type Mock } from 'vitest';
import { PrismaService } from './prisma.service';
import { ScheduleWriterService } from './schedule-writer.service';
import type { UpsertScheduleInput, ProvinceRef } from './schedule-writer.interfaces';
import { Logger } from '@nestjs/common';

type PrismaMock = {
  province: { upsert: Mock };
  city: { upsert: Mock };
  pharmacy: { upsert: Mock; findFirst: Mock };
  dutySchedule: { upsert: Mock };
  $executeRaw: Mock;
};

function makePrismaMock(): PrismaMock {
  return {
    province: { upsert: vi.fn() },
    city: { upsert: vi.fn() },
    pharmacy: { upsert: vi.fn(), findFirst: vi.fn() },
    dutySchedule: { upsert: vi.fn() },
    $executeRaw: vi.fn(),
  };
}

const PROVINCE: ProvinceRef = { name: 'Ourense', code: 'OR' };

function makeSchedule(overrides?: Partial<UpsertScheduleInput>): UpsertScheduleInput {
  return {
    pharmacy: {
      name: 'Farmacia Test',
      address: 'Calle Test 1',
      cityName: 'Ourense',
      provinceName: 'Ourense',
      phone: '988123456',
      lat: 42.34,
      lng: -7.86,
    },
    date: new Date('2026-04-06T00:00:00Z'),
    startTime: '09:00',
    endTime: '22:00',
    sourceUrl: 'https://example.com',
    ...overrides,
  };
}

describe('ScheduleWriterService', () => {
  let service: ScheduleWriterService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.province.upsert.mockResolvedValue({ id: 'prov-1', name: 'Ourense', code: 'OR' });
    prisma.city.upsert.mockResolvedValue({ id: 'city-1', name: 'Ourense', provinceId: 'prov-1' });
    prisma.pharmacy.findFirst.mockResolvedValue(null);
    prisma.pharmacy.upsert.mockResolvedValue({
      id: 'ph-1',
      name: 'Farmacia Test',
      address: 'Calle Test 1',
      phone: '988123456',
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
    prisma.$executeRaw.mockResolvedValue(1);

    service = new ScheduleWriterService(prisma as unknown as PrismaService);
    vi.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  it('retorna { saved: 0, skipped: 0 } si no hay schedules', async () => {
    const result = await service.upsertSchedules(PROVINCE, []);
    expect(result).toEqual({ saved: 0, skipped: 0 });
    expect(prisma.province.upsert).not.toHaveBeenCalled();
  });

  it('guarda un schedule correctamente (happy path)', async () => {
    const result = await service.upsertSchedules(PROVINCE, [makeSchedule()]);

    expect(result).toEqual({ saved: 1, skipped: 0 });
    expect(prisma.province.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.city.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.pharmacy.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.pharmacy.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.dutySchedule.upsert).toHaveBeenCalledTimes(1);
  });

  it('llama a $executeRaw cuando la farmacia tiene coordenadas', async () => {
    await service.upsertSchedules(PROVINCE, [makeSchedule()]);

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('NO llama a $executeRaw cuando la farmacia NO tiene coordenadas', async () => {
    const schedule = makeSchedule({
      pharmacy: {
        name: 'Sin Coords',
        address: 'Calle X',
        cityName: 'Ourense',
        provinceName: 'Ourense',
      },
    });

    await service.upsertSchedules(PROVINCE, [schedule]);

    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('usa id "new" cuando la farmacia no existe en BD', async () => {
    prisma.pharmacy.findFirst.mockResolvedValue(null);

    await service.upsertSchedules(PROVINCE, [makeSchedule()]);

    expect(prisma.pharmacy.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'new' } }),
    );
  });

  it('usa el id existente cuando la farmacia ya existe en BD', async () => {
    prisma.pharmacy.findFirst.mockResolvedValue({ id: 'existing-ph' });

    await service.upsertSchedules(PROVINCE, [makeSchedule()]);

    expect(prisma.pharmacy.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'existing-ph' } }),
    );
  });

  it('un error en un schedule no detiene los demás', async () => {
    prisma.city.upsert
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValue({ id: 'city-1', name: 'Ourense', provinceId: 'prov-1' });

    const result = await service.upsertSchedules(PROVINCE, [
      makeSchedule(),
      makeSchedule({
        pharmacy: {
          name: 'Farmacia 2',
          address: 'Calle 2',
          cityName: 'Ourense',
          provinceName: 'Ourense',
        },
      }),
    ]);

    expect(result).toEqual({ saved: 1, skipped: 1 });
  });

  it('guarda múltiples schedules correctamente', async () => {
    const schedules = [
      makeSchedule(),
      makeSchedule({
        pharmacy: {
          name: 'Farmacia 2',
          address: 'Calle 2',
          cityName: 'Ourense',
          provinceName: 'Ourense',
          phone: '988999000',
        },
        startTime: '22:00',
        endTime: '09:00',
      }),
    ];

    const result = await service.upsertSchedules(PROVINCE, schedules);

    expect(result).toEqual({ saved: 2, skipped: 0 });
    expect(prisma.province.upsert).toHaveBeenCalledTimes(1); // solo 1 vez
    expect(prisma.dutySchedule.upsert).toHaveBeenCalledTimes(2);
  });
});
