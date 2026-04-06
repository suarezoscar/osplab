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
    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
    include: ['apps/farmacias-web/src/**/*.spec.ts'],
    coverage: {
      reportsDirectory: 'coverage/apps/farmacias-web',
      include: ['apps/farmacias-web/src/**'],
      exclude: ['apps/farmacias-web/src/**/*.spec.ts', 'apps/farmacias-web/src/main.ts'],
    },
  },
});
