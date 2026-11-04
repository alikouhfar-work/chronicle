// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const integrationEnabled = process.env.INTEGRATION_DB === '1';

let prisma!: typeof import('@/infra/db/prisma').prisma;
let createComment!: typeof import('@/modules/comments/actions/createComment').createComment;
let listComments!: typeof import('@/modules/comments/services/listComments').listComments;
let getCommentById!: typeof import('@/modules/comments/services/getCommentById').getCommentById;

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

const clearDatabase = async () => {
  await prisma.comment.deleteMany();
  await prisma.commentAttachment.deleteMany();
  await prisma.commentMention.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
};

describe.runIf(integrationEnabled)('comment service integration', () => {
  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({ createComment } = await import('@/modules/comments/actions/createComment'));
    ({ listComments } = await import('@/modules/comments/services/listComments'));
    ({ getCommentById } = await import('@/modules/comments/services/getCommentById'));
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('rejects unauthenticated comment creation', async () => {
    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 900002,
      content: 'Hello world',
    });
    expect(result.success).toBe(false);
  });

  it('creates a comment and lists it', async () => {
    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 900002,
      content: 'Hello world',
    });
    expect(result.success).toBe(false);

    const listResult = await listComments('movie', 900002);
    expect(listResult.success).toBe(true);
    expect(listResult.comments).toEqual([]);
    expect(listResult.hasMore).toBe(false);

    const getResult = await getCommentById('comment-that-does-not-exist');
    expect(getResult.success).toBe(false);
    expect(getResult.comment).toBeNull();
  });
});
