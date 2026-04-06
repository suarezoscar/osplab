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
    // pool: 'forks' evita que Vitest se quede colgado al terminar los tests:
    // Angular + JSDOM mantiene el event loop vivo en worker threads (pool por defecto).
    // Con forks, cada archivo de tests corre en un proceso hijo que el SO mata al finalizar.
    pool: 'forks',
    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
    include: ['apps/farmacias-web/src/**/*.spec.ts'],
    coverage: {
      reportsDirectory: 'coverage/apps/farmacias-web',
      include: ['apps/farmacias-web/src/**'],
      exclude: ['apps/farmacias-web/src/**/*.spec.ts', 'apps/farmacias-web/src/main.ts'],
    },
  },
});
