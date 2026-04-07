import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseConfig as any,
  defineConfig({
    test: {
      include: ['libs/farmacias/data-access/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/libs/farmacias/data-access',
        include: ['libs/farmacias/data-access/src/**'],
      },
    },
  }),
);
