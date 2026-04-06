import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['libs/api/scraper/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/libs/api/scraper',
        include: ['libs/api/scraper/src/**'],
      },
    },
  }),
);
