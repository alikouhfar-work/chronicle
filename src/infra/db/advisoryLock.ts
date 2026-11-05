import 'server-only';

import { createPrismaSession } from '@/infra/db/prisma';

/**
 * A Postgres advisory lock held by a dedicated connection.
 *
 * `pg_advisory_lock` is session-scoped, and Prisma's shared client is a pool —
 * a lock taken through it can be granted on one connection and released on
 * another, which silently fails. This opens a client of its own for the lock's
 * lifetime, then closes it: the lock is engine-wide (so every instance sees it)
 * and disappears if the process dies.
 */
export type AdvisoryLock = {
  release: () => Promise<void>;
};


export const acquireAdvisoryLock = async (key: number): Promise<AdvisoryLock | null> => {
  if (!Number.isInteger(key)) {
    throw new Error('Advisory lock keys must be integers');
  }

  const client = createPrismaSession();

  try {
    await client.$connect();
  } catch (error) {
    await client.$disconnect().catch(() => undefined);
    throw error;
  }

  const rows = await client.$queryRaw<
    Array<{ locked: boolean }>
  >`select pg_try_advisory_lock(${key}) as locked`;
  const locked = rows[0]?.locked === true;

  if (!locked) {
    await client.$disconnect();
    return null;
  }

  let released = false;
  return {
    release: async () => {
      if (released) return;
      released = true;
      try {
        await client.$queryRaw`select pg_advisory_unlock(${key})`;
      } finally {
        await client.$disconnect();
      }
    },
  };
};
