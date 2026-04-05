import { Injectable } from '@nestjs/common';
import { PrismaService } from '@farmacias-guardia/api-data-access';
import { PharmacyDto } from '@farmacias-guardia/shared-interfaces';
import { NearbyPharmaciesQueryDto } from './dto/nearby-pharmacies-query.dto';

@Injectable()
export class PharmaciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(query: NearbyPharmaciesQueryDto): Promise<PharmacyDto[]> {
    const { lat, lng, radiusMeters = 5000, date } = query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Consulta geoespacial con PostGIS — la distancia se calcula en la DB
    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        address: string;
        phone: string | null;
        city_name: string;
        province_name: string;
        distance_meters: number;
      }>
    >`
      SELECT
        p.id,
        p.name,
        p.address,
        p.phone,
        c.name AS city_name,
        pr.name AS province_name,
        ST_Distance(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance_meters
      FROM "Pharmacy" p
      INNER JOIN "City" c ON c.id = p."cityId"
      INNER JOIN "Province" pr ON pr.id = c."provinceId"
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
      LIMIT 20
    `;

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      city: row.city_name,
      province: row.province_name,
      distance: Math.round(row.distance_meters),
    }));
  }
}

