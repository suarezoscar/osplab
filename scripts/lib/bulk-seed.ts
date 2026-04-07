/**
 * bulk-seed.ts — Escritura bulk de ScrapedDutySchedule[] a PostgreSQL.
 *
 * Usa la API tipada de Prisma para todo excepto PostGIS (que requiere raw SQL).
 *
 * Estrategia:
 *   - Cities:        createMany(skipDuplicates) + findMany
 *   - Pharmacies:    createMany (nuevas) + $transaction batch de updates (existentes)
 *   - PostGIS:       1 raw SQL UPDATE … FROM VALUES (único SQL raw necesario)
 *   - DutySchedules: $transaction batch de upserts
 *
 * Prisma's batch $transaction([...]) envía todas las operaciones como un solo
 * request al servidor, eliminando la latencia por query individual.
 */

import { Prisma, PrismaClient } from '../../libs/farmacias/data-access/src/generated/prisma';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import type { ScrapedDutySchedule } from '../../libs/farmacias/scraper/src/lib/interfaces/scraper.interfaces';

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface BulkSeedConfig {
  provinceName: string;
  provinceCode: string;
}

export interface BulkSeedResult {
  saved: number;
  skipped: number;
}

type Logger = (msg: string) => void;

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * Máximo de operaciones por $transaction batch.
 * Prisma las envía como un solo request al servidor.
 * Con @prisma/adapter-pg (Supabase), las transacciones batch son interactivas
 * y tienen timeout — batches pequeños evitan exceder el límite.
 */
const BATCH_SIZE = 50;

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Escribe un array de schedules en la BD de forma eficiente.
 *
 * Flujo:
 *   1. Upsert provincia                          (Prisma ORM)
 *   2. Bulk insert ciudades                       (Prisma createMany)
 *   3. Bulk insert/update farmacias               (Prisma createMany + $transaction)
 *   4. Bulk update coordenadas PostGIS            (raw SQL — único necesario)
 *   5. Bulk upsert turnos de guardia              (Prisma $transaction)
 */
export async function bulkWriteSchedules(
  prisma: PrismaClient,
  config: BulkSeedConfig,
  schedules: ScrapedDutySchedule[],
  log: Logger,
): Promise<BulkSeedResult> {
  if (schedules.length === 0) return { saved: 0, skipped: 0 };

  const t0 = Date.now();

  // ── 1. Provincia ────────────────────────────────────────────────────
  const province = await prisma.province.upsert({
    where: { code: config.provinceCode },
    update: {},
    create: { name: config.provinceName, code: config.provinceCode },
  });
  log(`🗺️  Provincia: ${province.name} (${province.code})`);

  // ── 2. Ciudades ─────────────────────────────────────────────────────
  const cityMap = await bulkUpsertCities(prisma, schedules, province.id);
  log(`🏘️  ${cityMap.size} ciudad(es)`);

  // ── 3. Farmacias ────────────────────────────────────────────────────
  const { pharmacyMap, newCount, updatedCount } = await bulkUpsertPharmacies(
    prisma,
    schedules,
    cityMap,
    province.id,
  );
  log(`💊 ${pharmacyMap.size} farmacia(s) — ${newCount} nuevas, ${updatedCount} actualizadas`);

  // ── 4. Coordenadas PostGIS (único raw SQL necesario) ────────────────
  const locCount = await bulkUpdateLocations(prisma, schedules, cityMap, pharmacyMap);
  if (locCount > 0) log(`📍 ${locCount} coordenada(s) PostGIS`);

  // ── 5. Turnos de guardia ────────────────────────────────────────────
  const { saved, skipped } = await bulkUpsertDutySchedules(prisma, schedules, cityMap, pharmacyMap);
  log(`💾 ${saved} turno(s) de guardia — ${skipped} omitido(s)`);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`⚡ Escritura completada en ${elapsed}s`);

  return { saved, skipped };
}

// ─── Paso 2: Ciudades (Prisma ORM) ──────────────────────────────────────────

async function bulkUpsertCities(
  prisma: PrismaClient,
  schedules: ScrapedDutySchedule[],
  provinceId: string,
): Promise<Map<string, string>> {
  const uniqueNames = Array.from(new Set(schedules.map((s) => s.pharmacy.cityName)));

  // createMany con skipDuplicates = INSERT ... ON CONFLICT DO NOTHING
  if (uniqueNames.length > 0) {
    await prisma.city.createMany({
      data: uniqueNames.map((name) => ({ name, provinceId })),
      skipDuplicates: true,
    });
  }

  // Fetch todos los IDs (incluye las que ya existían)
  const cities = await prisma.city.findMany({
    where: { provinceId },
    select: { id: true, name: true },
  });

  return new Map(cities.map((c) => [c.name, c.id]));
}

// ─── Paso 3: Farmacias (Prisma ORM) ─────────────────────────────────────────

function pharmacyKey(name: string, address: string, cityId: string): string {
  return `${name}|${address}|${cityId}`;
}

interface PharmacyData {
  name: string;
  ownerName: string | null;
  address: string;
  phone: string | null;
  cityId: string;
}

async function bulkUpsertPharmacies(
  prisma: PrismaClient,
  schedules: ScrapedDutySchedule[],
  cityMap: Map<string, string>,
  provinceId: string,
): Promise<{ pharmacyMap: Map<string, string>; newCount: number; updatedCount: number }> {
  // 3a. Fetch todas las farmacias existentes de esta provincia (1 query)
  const existing = await prisma.pharmacy.findMany({
    where: { city: { provinceId } },
    select: { id: true, name: true, address: true, cityId: true },
  });

  const existingMap = new Map(
    existing.map((p) => [pharmacyKey(p.name, p.address, p.cityId), p.id]),
  );

  // 3b. Clasificar: nuevas vs. existentes (deduplicadas)
  const seen = new Set<string>();
  const toInsert: PharmacyData[] = [];
  const toUpdate: Array<PharmacyData & { id: string }> = [];

  for (const s of schedules) {
    const cityId = cityMap.get(s.pharmacy.cityName);
    if (!cityId) continue;
    const key = pharmacyKey(s.pharmacy.name, s.pharmacy.address, cityId);
    if (seen.has(key)) continue;
    seen.add(key);

    const data: PharmacyData = {
      name: s.pharmacy.name,
      ownerName: s.pharmacy.ownerName ?? null,
      address: s.pharmacy.address,
      phone: s.pharmacy.phone ?? null,
      cityId,
    };

    const existingId = existingMap.get(key);
    if (existingId) {
      toUpdate.push({ ...data, id: existingId });
    } else {
      toInsert.push(data);
    }
  }

  // 3c. Bulk INSERT nuevas (Prisma createMany)
  if (toInsert.length > 0) {
    await prisma.pharmacy.createMany({
      data: toInsert.map((p) => ({
        name: p.name,
        ownerName: p.ownerName,
        address: p.address,
        phone: p.phone,
        cityId: p.cityId,
      })),
    });
  }

  // 3d. Bulk UPDATE existentes (Prisma $transaction batch)
  const needsUpdate = toUpdate.filter((p) => p.phone !== null || p.ownerName !== null);
  let updatedCount = 0;

  if (needsUpdate.length > 0) {
    for (let i = 0; i < needsUpdate.length; i += BATCH_SIZE) {
      const chunk = needsUpdate.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(
        chunk.map((p) =>
          prisma.pharmacy.update({
            where: { id: p.id },
            data: {
              ...(p.phone !== null ? { phone: p.phone } : {}),
              ...(p.ownerName !== null ? { ownerName: p.ownerName } : {}),
            },
          }),
        ),
      );
    }
    updatedCount = needsUpdate.length;
  }

  // 3e. Re-fetch IDs (incluye las nuevas)
  const all = await prisma.pharmacy.findMany({
    where: { city: { provinceId } },
    select: { id: true, name: true, address: true, cityId: true },
  });

  const pharmacyMap = new Map(all.map((p) => [pharmacyKey(p.name, p.address, p.cityId), p.id]));

  return { pharmacyMap, newCount: toInsert.length, updatedCount };
}

// ─── Paso 4: PostGIS (raw SQL — Prisma no soporta tipos Geography) ──────────

async function bulkUpdateLocations(
  prisma: PrismaClient,
  schedules: ScrapedDutySchedule[],
  cityMap: Map<string, string>,
  pharmacyMap: Map<string, string>,
): Promise<number> {
  // Deduplicar por pharmacyId
  const updates = new Map<string, { lng: number; lat: number }>();

  for (const s of schedules) {
    if (s.pharmacy.lat == null || s.pharmacy.lng == null) continue;
    const cityId = cityMap.get(s.pharmacy.cityName);
    if (!cityId) continue;
    const key = pharmacyKey(s.pharmacy.name, s.pharmacy.address, cityId);
    const id = pharmacyMap.get(key);
    if (!id) continue;
    updates.set(id, { lng: s.pharmacy.lng, lat: s.pharmacy.lat });
  }

  if (updates.size === 0) return 0;

  // Batch update con raw SQL (única operación no soportada por el ORM)
  const entries = Array.from(updates.entries());
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const chunk = entries.slice(i, i + BATCH_SIZE);
    const values = chunk.map(
      ([id, { lng, lat }]) =>
        Prisma.sql`(${id}::text, ${lng}::double precision, ${lat}::double precision)`,
    );
    // noinspection SqlResolve — VALUES es válido en PostgreSQL como fuente de filas
    await prisma.$executeRaw`
      UPDATE "Pharmacy" AS p
      SET location = ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography
      FROM (VALUES ${Prisma.join(values)}) AS v(id, lng, lat)
      WHERE p.id = v.id
    `;
  }

  return updates.size;
}

// ─── Paso 5: DutySchedules (Prisma $transaction batch) ──────────────────────

async function bulkUpsertDutySchedules(
  prisma: PrismaClient,
  schedules: ScrapedDutySchedule[],
  cityMap: Map<string, string>,
  pharmacyMap: Map<string, string>,
): Promise<{ saved: number; skipped: number }> {
  // Preparar todas las operaciones de upsert
  interface DutyOp {
    pharmacyId: string;
    date: Date;
    startTime: string;
    endTime: string;
    source: string | null;
  }

  const ops: DutyOp[] = [];
  let skipped = 0;

  for (const s of schedules) {
    const cityId = cityMap.get(s.pharmacy.cityName);
    if (!cityId) {
      skipped++;
      continue;
    }
    const key = pharmacyKey(s.pharmacy.name, s.pharmacy.address, cityId);
    const pharmacyId = pharmacyMap.get(key);
    if (!pharmacyId) {
      skipped++;
      continue;
    }
    ops.push({
      pharmacyId,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      source: s.sourceUrl ?? null,
    });
  }

  // Enviar upserts en batches — cada $transaction es un solo round-trip
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const chunk = ops.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      chunk.map((op) =>
        prisma.dutySchedule.upsert({
          where: {
            pharmacyId_date: { pharmacyId: op.pharmacyId, date: op.date },
          },
          update: {
            startTime: op.startTime,
            endTime: op.endTime,
            source: op.source,
          },
          create: {
            pharmacyId: op.pharmacyId,
            date: op.date,
            startTime: op.startTime,
            endTime: op.endTime,
            source: op.source,
          },
        }),
      ),
    );
  }

  return { saved: ops.length, skipped };
}
