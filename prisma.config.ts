import { defineConfig, env } from 'prisma/config';
import * as path from 'path';

// Carga .env si existe (en CI/producción las vars ya están inyectadas por el entorno)
try {
  process.loadEnvFile(path.resolve(__dirname, '.env'));
} catch {
  // .env no existe → CI o producción, se ignora
}

export default defineConfig({
  schema: 'libs/api/data-access/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
