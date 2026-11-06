import { env } from '@/infra/env';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

const resolveConnectionString = (): string => {
  const isDemo = env.isDemoDatabase;
  const connectionString = isDemo ? env.demoDatabaseUrl : env.databaseUrl;

  if (!connectionString) {
    // `next build` collects route config without a live DB or production env.
    // A placeholder is enough — the real URL is injected at runtime
    // (see Dockerfile builder ARG). Never swallow a missing URL at runtime.
    if (env.isBuildPhase) {
      console.warn(
        `[infra/db] Missing ${isDemo ? 'DEMO_DATABASE_URL' : 'DATABASE_URL'} during build — using placeholder.`,
      );
      return 'postgresql://localhost:5434/chronicle_build_placeholder';
    }
    throw new Error(
      `[infra/db] Missing database URL. PRISMA_TARGET=${env.prismaTarget ?? '(unset)'}. ` +
        `Set ${isDemo ? 'DEMO_DATABASE_URL' : 'DATABASE_URL'}.`,
    );
  }

  return connectionString;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

/**
 * A dedicated client with its own pool. Needed when correctness depends on one
 * pinned connection — a Postgres advisory lock is session-scoped, and the shared
 * client would hand the lock and the unlock to different connections.
 */
export const createPrismaSession = (): PrismaClient => createPrismaClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
