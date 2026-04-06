import { Injectable } from '@nestjs/common';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import { PharmacyDto } from '@farmacias-guardia/shared-interfaces';
import { NearbyPharmaciesQueryDto } from './dto/nearby-pharmacies-query.dto';

@Injectable()
export class PharmaciesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve las 3 farmacias de guardia más cercanas a las coordenadas dadas,
   * sin límite de radio — siempre encuentra algo si hay datos en la BD.
   */
  async findNearest(query: NearbyPharmaciesQueryDto): Promise<PharmacyDto[]> {
    const { lat, lng, date } = query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        owner_name: string | null;
        address: string;
        phone: string | null;
        city_name: string;
        province_name: string;
        distance_meters: number;
        start_time: string;
        end_time: string;
        lat: number;
        lng: number;
      }>
    >`
      WITH candidates AS (
        SELECT
          p.id,
          p.name,
          p."ownerName"  AS owner_name,
          p.address,
          p.phone,
          c.name  AS city_name,
          pr.name AS province_name,
          ds."startTime" AS start_time,
          ds."endTime"   AS end_time,
          ST_Y(p.location::geometry) AS lat,
          ST_X(p.location::geometry) AS lng,
          ST_Distance(
            p.location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance_meters,
          -- Clave de deduplicación: teléfono si existe, si no coordenadas redondeadas a 3 decimales
          COALESCE(
            p.phone,
            CONCAT(
              ROUND(ST_Y(p.location::geometry)::numeric, 3), ',',
              ROUND(ST_X(p.location::geometry)::numeric, 3)
            )
          ) AS dedup_key,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(
              p.phone,
              CONCAT(
                ROUND(ST_Y(p.location::geometry)::numeric, 3), ',',
                ROUND(ST_X(p.location::geometry)::numeric, 3)
              )
            )
            ORDER BY ST_Distance(
              p.location::geography,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
            ) ASC
          ) AS rn
        FROM "Pharmacy" p
        INNER JOIN "City"         c  ON c.id  = p."cityId"
        INNER JOIN "Province"     pr ON pr.id = c."provinceId"
        INNER JOIN "DutySchedule" ds ON ds."pharmacyId" = p.id
        WHERE
          p.location IS NOT NULL
          AND ds.date = ${targetDate}
      )
      SELECT id, name, owner_name, address, phone, city_name, province_name,
             start_time, end_time, lat, lng, distance_meters
      FROM candidates
      WHERE rn = 1
      ORDER BY distance_meters ASC
      LIMIT 3
    `;

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      ownerName: row.owner_name,
      address: row.address,
      phone: row.phone,
      city: row.city_name,
      province: row.province_name,
      distance: Math.round(row.distance_meters),
      startTime: row.start_time,
      endTime: row.end_time,
      lat: row.lat,
      lng: row.lng,
    }));
  }
}
