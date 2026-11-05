import { execFileSync } from 'node:child_process';

/**
 * Prepares a deterministic account for the journeys: one login user and one
 * neighbour to mention. Runs against `E2E_DATABASE_URL`, which must end in
 * `_test` — the same guard the integration suites use, so a stray run can never
 * touch dev data.
 */
export const account = {
  email: 'e2e@chronicle.test',
  password: 'e2e-password-123',
  neighbourUsername: 'e2eneighbour',
};

const databaseUrl = (): string => {
  const url = process.env.E2E_DATABASE_URL ?? '';
  const name = (() => {
    try {
      return new URL(url).pathname.replace(/^\//, '');
    } catch {
      return '';
    }
  })();

  if (!name.endsWith('_test')) {
    throw new Error(
      `E2E_DATABASE_URL must point at a database ending in "_test" (got "${name || '(missing)'}").`,
    );
  }

  return url;
};

export default async function globalSetup(): Promise<void> {
  const url = databaseUrl();

  // A child process, not an import: the generated Prisma client is ESM and
  // Playwright's transpiler loads the config as CJS.
  execFileSync('npx', ['tsx', 'e2e/seed.ts'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
