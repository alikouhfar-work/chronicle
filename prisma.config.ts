import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const isDemo = process.env.PRISMA_TARGET === 'demo';

const url = isDemo
  ? process.env.DEMO_DATABASE_URL
  : process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    isDemo
      ? 'DEMO_DATABASE_URL is not set (PRISMA_TARGET=demo)'
      : 'DATABASE_URL is not set',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
    path: 'prisma/migrations',
  },
  datasource: {
    url,
  },
});
