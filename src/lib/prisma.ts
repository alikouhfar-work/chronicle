import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString =
  process.env.VERCEL_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.DEMO_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    `No database URL resolved. VERCEL_ENV=${process.env.VERCEL_ENV}`,
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
