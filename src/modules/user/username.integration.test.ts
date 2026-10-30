// @vitest-environment node

import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
const integrationEnabled = process.env.INTEGRATION_DB === '1';

let prisma!: typeof import('@/infra/db/prisma').prisma;
let ensureUsername!: typeof import('@/modules/user/services/userService').ensureUsername;

const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').pathname.replace(/^\//, '');
  } catch {
    return '';
  }
})();

if (integrationEnabled && !databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run integration tests against "${databaseName || '(missing database)'}". ` +
      'Set DATABASE_URL to a database whose name ends in "_test".',
  );
}

const migrationSql = readFileSync(
  new URL(
    '../../../prisma/migrations/20261030130000_backfill_usernames/migration.sql',
    import.meta.url,
  ),
  'utf8',
);

const snapshot = async () => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
    orderBy: { id: 'asc' },
  });
  return users;
};

const clearUsers = async () => {
  await prisma.rewatchLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commentMention.deleteMany();
  await prisma.commentAttachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
};

describe.skipIf(!integrationEnabled)('username backfill', () => {
  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({ ensureUsername } = await import('@/modules/user/services/userService'));
  });

  beforeEach(async () => {
    await clearUsers();
  });

  afterAll(async () => {
    await clearUsers();
    await prisma.$disconnect();
  });

  it('assigns a unique, valid handle to every user and is idempotent', async () => {
    const seed: { email: string; username?: string }[] = [
      { email: 'jane.doe@example.com', username: 'already_set' },
      { email: 'jane.doe@other.com' },
      { email: 'JANE.DOE@third.com' },
      { email: 'ab@example.com' },
      { email: '___@example.com' },
      { email: 'alice+movies@example.com' },
    ];

    for (const [index, data] of seed.entries()) {
      await prisma.user.create({
        data: {
          ...data,
          createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)),
        },
      });
    }

    await prisma.$executeRawUnsafe(migrationSql);
    const first = await snapshot();

    expect(first.every((user) => user.username !== null)).toBe(true);
    expect(new Set(first.map((user) => user.username)).size).toBe(first.length);

    const byEmail = new Map(
      (
        await prisma.user.findMany({
          select: { email: true, username: true },
        })
      ).map((user) => [user.email, user.username]),
    );

    expect(byEmail.get('jane.doe@other.com')).toBe('janedoe');
    expect(byEmail.get('JANE.DOE@third.com')).toBe('janedoe_2');
    expect(byEmail.get('alice+movies@example.com')).toBe('alicemovies');
    expect(
      (await prisma.user.findUnique({ where: { email: 'jane.doe@example.com' } }))?.username,
    ).toBe('already_set');

    for (const username of first.map((user) => user.username)) {
      expect(username).toMatch(/^[a-z0-9_]{3,32}$/);
    }

    await prisma.$executeRawUnsafe(migrationSql);
    expect(await snapshot()).toEqual(first);
  });

  it('ensureUsername reuses an existing handle and resolves collisions', async () => {
    const first = await prisma.user.create({ data: { email: 'sam@example.com' } });
    const second = await prisma.user.create({ data: { email: 'sam@other.com' } });

    await expect(ensureUsername(first.id)).resolves.toBe('sam');
    await expect(ensureUsername(second.id)).resolves.toBe('sam_2');
    await expect(ensureUsername(first.id)).resolves.toBe('sam');
  });
});
