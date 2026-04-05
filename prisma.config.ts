import { defineConfig, env } from 'prisma/config';
import * as path from 'path';

// Carga el fichero .env antes de que Prisma intente resolver las variables
process.loadEnvFile(path.resolve(__dirname, '.env'));

export default defineConfig({
  schema: 'libs/api/data-access/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
