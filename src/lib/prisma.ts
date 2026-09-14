import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const isDemo = process.env.PRISMA_TARGET === 'demo';

const connectionString = isDemo
  ? process.env.DEMO_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    `No database URL resolved. PRISMA_TARGET=${process.env.PRISMA_TARGET}`,
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString });

const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
