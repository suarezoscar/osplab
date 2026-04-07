import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { ProvinceRef, UpsertResult, UpsertScheduleInput } from './schedule-writer.interfaces';

/**
 * Servicio compartido que persiste turnos de guardia scrapeados.
 *
 * Centraliza la lógica de upsert (province → city → pharmacy → PostGIS → dutySchedule)
 * que antes se repetía en cada scraper (~60 líneas × 4).
 */
@Injectable()
export class ScheduleWriterService {
  private readonly logger = new Logger(ScheduleWriterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persiste un array de turnos de guardia asociados a una provincia.
   *
   * @param province  - Nombre y código de la provincia (para upsert)
   * @param schedules - Turnos scrapeados a guardar
   * @returns          Número de turnos guardados y omitidos
   */
  async upsertSchedules(
    province: ProvinceRef,
    schedules: UpsertScheduleInput[],
  ): Promise<UpsertResult> {
    if (schedules.length === 0) return { saved: 0, skipped: 0 };

    const provinceRecord = await this.prisma.province.upsert({
      where: { code: province.code },
      update: {},
      create: { name: province.name, code: province.code },
    });

    let saved = 0;
    let skipped = 0;

    for (const schedule of schedules) {
      try {
        // 1. Upsert ciudad
        const city = await this.prisma.city.upsert({
          where: {
            name_provinceId: {
              name: schedule.pharmacy.cityName,
              provinceId: provinceRecord.id,
            },
          },
          update: {},
          create: {
            name: schedule.pharmacy.cityName,
            provinceId: provinceRecord.id,
          },
        });

        // 2. Upsert farmacia (identificada por nombre + dirección + ciudad)
        const pharmacyId = await this.findPharmacyId(
          schedule.pharmacy.name,
          schedule.pharmacy.address,
          city.id,
        );

        const pharmacy = await this.prisma.pharmacy.upsert({
          where: { id: pharmacyId },
          update: {
            phone: schedule.pharmacy.phone ?? undefined,
            ownerName: schedule.pharmacy.ownerName ?? undefined,
          },
          create: {
            name: schedule.pharmacy.name,
            ownerName: schedule.pharmacy.ownerName,
            address: schedule.pharmacy.address,
            phone: schedule.pharmacy.phone,
            cityId: city.id,
          },
        });

        // 3. Actualizar localización PostGIS si hay coordenadas
        if (schedule.pharmacy.lat != null && schedule.pharmacy.lng != null) {
          await this.prisma.$executeRaw`
            UPDATE "Pharmacy"
            SET location = ST_SetSRID(
              ST_MakePoint(${schedule.pharmacy.lng}, ${schedule.pharmacy.lat}),
              4326
            )::geography
            WHERE id = ${pharmacy.id}
          `;
        }

        // 4. Upsert turno de guardia
        await this.prisma.dutySchedule.upsert({
          where: {
            pharmacyId_date: {
              pharmacyId: pharmacy.id,
              date: schedule.date,
            },
          },
          update: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            source: schedule.sourceUrl,
          },
          create: {
            pharmacyId: pharmacy.id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            source: schedule.sourceUrl,
          },
        });

        saved++;
      } catch (err) {
        skipped++;
        this.logger.warn(
          `⚠️  Error al guardar ${schedule.pharmacy.name}: ${(err as Error).message}`,
        );
      }
    }

    return { saved, skipped };
  }

  /**
   * Busca el ID de una farmacia por nombre + dirección + ciudad.
   * Retorna 'new' si no existe (para que upsert use la rama create).
   */
  private async findPharmacyId(name: string, address: string, cityId: string): Promise<string> {
    const existing = await this.prisma.pharmacy.findFirst({
      where: { name, address, cityId },
      select: { id: true },
    });
    return existing?.id ?? 'new';
  }
}
