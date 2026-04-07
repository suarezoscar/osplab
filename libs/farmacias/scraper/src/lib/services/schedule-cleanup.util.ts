import { PrismaService } from '@osplab/farmacias-data-access';
import { Logger } from '@nestjs/common';
import { getSpainToday } from '../utils/spain-date.util';

/**
 * Elimina los `DutySchedule` cuya fecha sea estrictamente anterior a hoy.
 * Se llama al inicio de cada scrape para evitar que datos obsoletos
 * aparezcan en las consultas.
 *
 * @param prisma  - Instancia de PrismaService
 * @param logger  - Logger del servicio llamante
 * @param label   - Nombre del scraper (para el log)
 */
export async function cleanOldSchedules(
  prisma: PrismaService,
  logger: Logger,
  label: string,
): Promise<void> {
  try {
    const today = getSpainToday();

    const deleted = await prisma.dutySchedule.deleteMany({
      where: { date: { lt: today } },
    });

    if (deleted.count > 0) {
      logger.log(`🧹 ${label}: eliminados ${deleted.count} turnos de guardia anteriores a hoy`);
    }
  } catch (err) {
    logger.warn(`⚠️  ${label}: error al limpiar turnos viejos — ${(err as Error).message}`);
  }
}
