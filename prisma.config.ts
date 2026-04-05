import { defineConfig, env } from 'prisma/config';

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
  schema: 'libs/api/data-access/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
