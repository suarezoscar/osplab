import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['apps/api/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/apps/api',
        include: ['apps/api/src/**'],
      },
    },
  }),
);
