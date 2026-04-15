import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [
    angular({ tsconfig: resolve(__dirname, 'tsconfig.spec.json') }) as any,
    tsconfigPaths({ root: resolve(__dirname, '../..') }) as any,
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',
    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
    include: ['apps/events/src/**/*.spec.ts'],
    coverage: {
      reportsDirectory: 'coverage/apps/events',
      include: ['apps/events/src/**'],
      exclude: ['apps/events/src/**/*.spec.ts', 'apps/events/src/main.ts'],
    },
  },
});
