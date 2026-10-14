import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

const resolveConnectionString = (): string => {
  const isDemo = process.env.PRISMA_TARGET === 'demo';
  const connectionString = isDemo ? process.env.DEMO_DATABASE_URL : process.env.DATABASE_URL;

  if (!connectionString) {
    // `next build` collects route config without a live DB or production env.
    // A placeholder is enough — the real URL is injected at runtime
    // (see Dockerfile builder ARG). Never swallow a missing URL at runtime.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(
        `[infra/db] Missing ${isDemo ? 'DEMO_DATABASE_URL' : 'DATABASE_URL'} during build — using placeholder.`,
      );
      return 'postgresql://localhost:5434/chronicle_build_placeholder';
    }
    throw new Error(
      `[infra/db] Missing database URL. PRISMA_TARGET=${process.env.PRISMA_TARGET ?? '(unset)'}. ` +
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
