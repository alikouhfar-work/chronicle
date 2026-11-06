import { hash } from 'bcryptjs';
import 'dotenv/config';
import { prisma } from '../src/infra/db/prisma';

/**
 * Deterministic e2e accounts. Run by `e2e/global-setup.ts` through `tsx` because
 * Playwright's own loader cannot import the app's generated Prisma client
 * (`import.meta` in a CJS transform).
 */
export const E2E_EMAIL = 'e2e@chronicle.test';
export const E2E_PASSWORD = 'e2e-password-123';
const NEIGHBOUR_EMAIL = 'neighbour@chronicle.test';

const main = async (): Promise<void> => {
  const passwordHash = await hash(E2E_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: E2E_EMAIL },
    create: { email: E2E_EMAIL, name: 'E2E User', username: 'e2euser', passwordHash },
    update: { passwordHash },
  });

  await prisma.user.upsert({
    where: { email: NEIGHBOUR_EMAIL },
    create: {
      email: NEIGHBOUR_EMAIL,
      name: 'E2E Neighbour',
      username: 'e2eneighbour',
      passwordHash,
    },
    update: { username: 'e2eneighbour' },
  });

  await prisma.$disconnect();
};

void main();
