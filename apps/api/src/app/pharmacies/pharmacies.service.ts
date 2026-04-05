import { Injectable } from '@nestjs/common';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import { PharmacyDto } from '@farmacias-guardia/shared-interfaces';
import { NearbyPharmaciesQueryDto } from './dto/nearby-pharmacies-query.dto';

@Injectable()
export class PharmaciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearest(query: NearbyPharmaciesQueryDto): Promise<PharmacyDto | null> {
    const { lat, lng, radiusMeters = 50000, date } = query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Consulta geoespacial con PostGIS — devuelve SOLO la más cercana
    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
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
      SELECT
        p.id,
        p.name,
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
        ) AS distance_meters
      FROM "Pharmacy" p
      INNER JOIN "City"         c  ON c.id  = p."cityId"
      INNER JOIN "Province"     pr ON pr.id = c."provinceId"
      INNER JOIN "DutySchedule" ds ON ds."pharmacyId" = p.id
      WHERE
        p.location IS NOT NULL
        AND ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
        AND ds.date = ${targetDate}
      ORDER BY distance_meters ASC
      LIMIT 1
    `;

    if (results.length === 0) return null;

    const row = results[0];
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      city: row.city_name,
      province: row.province_name,
      distance: Math.round(row.distance_meters),
      startTime: row.start_time,
      endTime: row.end_time,
      lat: row.lat,
      lng: row.lng,
    };
  }
}

