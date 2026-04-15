import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseConfig as any,
  defineConfig({
    test: {
      passWithNoTests: true,
      include: ['libs/events/data-access/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/libs/events/data-access',
        include: ['libs/events/data-access/src/**'],
      },
    },
  }),
);
