import { defineConfig, env } from 'prisma/config';
import * as path from 'path';

// Carga .env si existe (en CI/producción las vars ya están inyectadas por el entorno)
try {
  process.loadEnvFile(path.resolve(__dirname, '.env'));
} catch {
  // .env no existe → CI o producción, se ignora
}

export default defineConfig({
  schema: 'libs/farmacias/data-access/prisma/schema.prisma',
  datasource: {
    // Prisma Migrate necesita conexión directa a PostgreSQL.
    // En producción/CI: DIRECT_URL → conexión directa a Supabase (sin pooler).
    // En local: DIRECT_URL no suele existir → cae back a DATABASE_URL.
    url: process.env['DIRECT_URL'] || env('DATABASE_URL'),
  },
});
