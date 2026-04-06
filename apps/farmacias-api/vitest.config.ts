import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['apps/farmacias-api/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/apps/farmacias-api',
        include: ['apps/farmacias-api/src/**'],
      },
    },
  }),
);
