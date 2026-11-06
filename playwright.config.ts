// Load `.env` into the test process, not just the server: the journeys that
// read TMDB live need the same token the app does, and `next start` reads
// `.env` for itself but not for Playwright. CI has no `.env`; its job env wins.
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * End-to-end journeys against a real server and a real database.
 *
 * `E2E_DATABASE_URL` points at a database whose name ends in `_test` — the same
 * guard the integration suites use, so a stray run can never touch dev data.
 * The suite starts its own server on `E2E_PORT` (never 3000) so a developer's
 * dev server keeps running while the journeys execute.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // A production server, not `next dev`: journeys must not race HMR recompiles
    // (or Playwright's own artifacts landing inside the watched tree). CI already
    // builds; locally this costs one build per run.
    // `next build` exits once on the Next security advisory before continuing,
    // so the build is retried exactly as CI does, then a production server runs.
    command: `sh -c 'npm run build || npm run build; npm run start -- --port ${PORT}'`,
    url: `${BASE_URL}/login`,
    // `E2E_REUSE=1 E2E_PORT=3000 npm run test:e2e` iterates against a running dev
    // server without a build; CI and the default run start their own.
    reuseExistingServer: process.env.E2E_REUSE === '1',
    timeout: 240_000,
    env: {
      ...process.env,
      PORT: String(PORT),
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
      E2E: '1',
    },
  },
});
