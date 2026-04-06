import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['libs/farmacias/scraper/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/libs/farmacias/scraper',
        include: ['libs/farmacias/scraper/src/**'],
      },
    },
  }),
);
