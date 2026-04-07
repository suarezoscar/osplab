import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseConfig as any,
  defineConfig({
    test: {
      include: ['apps/farmacias-api/e2e/src/**/*.spec.ts'],
      globalSetup: 'apps/farmacias-api/e2e/src/support/global-setup.ts',
      setupFiles: ['apps/farmacias-api/e2e/src/support/test-setup.ts'],
      testTimeout: 15_000,
      coverage: {
        reportsDirectory: 'coverage/apps/farmacias-api-e2e',
      },
    },
  }),
);
