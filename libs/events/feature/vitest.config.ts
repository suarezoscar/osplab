import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.config';

export default mergeConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseConfig as any,
  defineConfig({
    test: {
      include: ['libs/events/feature/src/**/*.spec.ts'],
      coverage: {
        reportsDirectory: 'coverage/libs/events/feature',
        include: ['libs/events/feature/src/**'],
      },
    },
  }),
);
