import { vi, type Mock, type Mocked } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@osplab/farmacias-data-access';
import { cleanOldSchedules } from './schedule-cleanup.util';

type PrismaMock = {
  dutySchedule: { deleteMany: Mock };
};

function makePrismaMock(): PrismaMock {
  return {
    dutySchedule: { deleteMany: vi.fn() },
  };
}

describe('cleanOldSchedules', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let logger: Mocked<Logger>;

  beforeEach(() => {
    prisma = makePrismaMock();
    logger = { log: vi.fn(), warn: vi.fn() } as unknown as Mocked<Logger>;
  });

  it('llama a deleteMany con date < hoy (sin hora)', async () => {
    prisma.dutySchedule.deleteMany.mockResolvedValue({ count: 0 });

    await cleanOldSchedules(prisma as unknown as PrismaService, logger, 'Test');

    expect(prisma.dutySchedule.deleteMany).toHaveBeenCalledTimes(1);
    const call = prisma.dutySchedule.deleteMany.mock.calls[0][0];
    const ltDate = call?.where?.date?.lt as Date;
    expect(ltDate).toBeInstanceOf(Date);
    expect(ltDate.getUTCHours()).toBe(0);
    expect(ltDate.getUTCMinutes()).toBe(0);
  });

  it('registra log si se eliminaron turnos', async () => {
    prisma.dutySchedule.deleteMany.mockResolvedValue({ count: 5 });

    await cleanOldSchedules(prisma as unknown as PrismaService, logger, 'COF Test');

    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('5'));
  });

  it('no registra log si count === 0', async () => {
    prisma.dutySchedule.deleteMany.mockResolvedValue({ count: 0 });

    await cleanOldSchedules(prisma as unknown as PrismaService, logger, 'COF Test');

    expect(logger.log).not.toHaveBeenCalled();
  });

  it('llama a logger.warn si deleteMany lanza — sin re-lanzar el error', async () => {
    prisma.dutySchedule.deleteMany.mockRejectedValue(new Error('DB connection failed'));

    await expect(
      cleanOldSchedules(prisma as unknown as PrismaService, logger, 'COF Test'),
    ).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('DB connection failed'));
  });
});
