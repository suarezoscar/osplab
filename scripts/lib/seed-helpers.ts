/**
 * seed-helpers.ts — Utilidades compartidas por todos los scripts de seed.
 *
 * Centraliza:
 *   - Conexión a BD (DATABASE_URL + PrismaPg + PrismaClient)
 *   - Helpers de consola (log, section, sleep)
 *   - Limpieza de turnos antiguos
 *   - Resumen final de BD
 *   - Orquestación con runSeed()
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../libs/farmacias/data-access/src/generated/prisma';
// noinspection ES6PreferShortImport — jiti no resuelve tsconfig paths ni barrels con dependencias NestJS
import { getSpainToday } from '../../libs/farmacias/scraper/src/lib/utils/spain-date.util';

// Re-exportar para que los seeds solo importen de aquí
export { bulkWriteSchedules } from './bulk-seed';
export type { BulkSeedConfig, BulkSeedResult } from './bulk-seed';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type Logger = (msg: string) => void;

export interface SeedContext {
  prisma: PrismaClient;
  log: Logger;
  section: (title: string) => void;
  sleep: (ms: number) => Promise<void>;
  /**
   * Elimina turnos de guardia anteriores a hoy.
   * Llamar SOLO después de confirmar que el scrape fue exitoso
   * y hay datos nuevos para insertar — así nunca borramos sin reemplazo.
   */
  cleanup: () => Promise<void>;
}

// ─── Helpers de consola ──────────────────────────────────────────────────────

export function log(msg: string): void {
  console.log(`  ${msg}`);
}

export function section(title: string): void {
  console.log(`\n${'─'.repeat(55)}\n${title}\n${'─'.repeat(55)}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Conexión a BD ───────────────────────────────────────────────────────────

export function createPrisma(): PrismaClient {
  const DATABASE_URL = process.env['DATABASE_URL'];
  if (!DATABASE_URL) {
    console.error('❌  DATABASE_URL no está definida. Copia .env.example en .env y rellénalo.');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  return new PrismaClient({
    adapter,
    transactionOptions: {
      timeout: 30_000, // 30s — necesario para Supabase con latencia de red
    },
  } as never);
}

// ─── Limpieza de turnos antiguos ─────────────────────────────────────────────

export async function deleteOldSchedules(prisma: PrismaClient): Promise<void> {
  const today = getSpainToday();
  const deleted = await prisma.dutySchedule.deleteMany({ where: { date: { lt: today } } });
  if (deleted.count > 0) log(`🧹 Eliminados ${deleted.count} turnos de guardia anteriores a hoy`);
}

// ─── Resumen final ───────────────────────────────────────────────────────────

export async function printSummary(prisma: PrismaClient): Promise<void> {
  const withLocation = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) FROM "Pharmacy" WHERE location IS NOT NULL
  `;
  const total = await prisma.pharmacy.count();
  const scheduleCount = await prisma.dutySchedule.count();

  log('📊 BD ahora tiene:');
  log(`   - ${total} farmacia(s) en total`);
  log(`   - ${Number(withLocation[0].count)} con coordenadas PostGIS`);
  log(`   - ${scheduleCount} turno(s) de guardia`);
}

// ─── Orquestador ─────────────────────────────────────────────────────────────

export interface RunSeedOptions {
  skipSummary?: boolean;
}

/**
 * Orquesta el ciclo de vida de un seed script:
 *   1. Crea la conexión a BD
 *   2. Ejecuta la lógica específica del seed
 *      → El seed llama ctx.cleanup() SOLO si el scrape fue exitoso
 *   3. Imprime resumen (salvo skipSummary)
 *   4. Desconecta y maneja errores
 */
export function runSeed(
  name: string,
  seedFn: (ctx: SeedContext) => Promise<void>,
  options?: RunSeedOptions,
): void {
  const prisma = createPrisma();
  const cleanup = () => deleteOldSchedules(prisma);
  const ctx: SeedContext = { prisma, log, section, sleep, cleanup };

  const main = async () => {
    section(name);
    await prisma.$connect();
    log('✅ Conectado a PostgreSQL');

    await seedFn(ctx);

    if (!options?.skipSummary) {
      await printSummary(prisma);
    }
  };

  main()
    .catch((err) => {
      console.error('\n❌ Error fatal:', err.message);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
