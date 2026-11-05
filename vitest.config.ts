import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Server-only guards are a runtime/bundler concern; tests import these
      // modules directly on Node.
      'server-only': path.resolve(__dirname, 'node_modules/server-only/empty.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    // Integration suites share one Postgres database and truncate it between
    // tests, so their files must not run concurrently.
    ...(process.env.INTEGRATION_DB === '1' ? { fileParallelism: false, maxWorkers: 1 } : {}),
  },
});
