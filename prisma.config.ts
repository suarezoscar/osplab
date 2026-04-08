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
    // Prisma Migrate necesita una conexión que soporte advisory locks y DDL.
    // En CI (GitHub Actions): DIRECT_URL se establece al Session Pooler de Supabase
    //   (aws-X-eu-north-1.pooler.supabase.com:5432) — accesible desde IPs dinámicas
    //   sin necesidad del add-on IPv4 de Supabase.
    //   ⚠️  NO usar la URL directa (db.vrqaamkqoiuppqtrzpbu.supabase.co:5432) en CI:
    //       está bloqueada para IPs dinámicas a menos que el add-on IPv4 esté activo.
    // En local: DIRECT_URL no suele existir → cae back a DATABASE_URL (.env).
    url: process.env['DIRECT_URL'] || env('DATABASE_URL'),
  },
});
