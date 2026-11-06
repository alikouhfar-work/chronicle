import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  findMovie: vi.fn(),
  findShow: vi.fn(),
  findEpisode: vi.fn(),
  findUsers: vi.fn(),
  requireUserId: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    comment: { findMany: mocks.findMany, create: mocks.create },
    movie: { findFirst: mocks.findMovie },
    show: { findFirst: mocks.findShow },
    episode: { findFirst: mocks.findEpisode },
    user: { findMany: mocks.findUsers },
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.requireUserId,
}));

vi.mock('@/infra/auth/auth', () => ({
  auth: mocks.auth,
}));

import { createComment } from '@/modules/comments/actions/createComment';
import { listComments } from '@/modules/comments/services/listComments';

const commentRow = {
  id: 'comment-1',
  content: 'Great episode',
  createdAt: new Date('2026-10-31T12:00:00Z'),
  user: { id: 'user-1', username: 'viewer', name: 'Viewer', image: null },
  attachments: [],
};

describe('comment service TMDB scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue('user-1');
    mocks.auth.mockResolvedValue(null);
    mocks.findMany.mockResolvedValue([]);
  });

  it('lists comments by media type and TMDB id', async () => {
    const result = await listComments('movie', 550);

    expect(result.success).toBe(true);
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany.mock.calls[0][0].where).toMatchObject({
      mediaType: 'MOVIE',
      tmdbId: 550,
    });
    // Comments are hard-deleted, so the feed has no tombstone filter.
    expect(mocks.findMany.mock.calls[0][0].where).not.toHaveProperty('deletedAt');
  });

  it('scopes show and episode feeds by their TMDB ids', async () => {
    await listComments('show', 95396);
    await listComments('episode', 1982925);

    expect(mocks.findMany.mock.calls[0][0].where).toMatchObject({
      mediaType: 'SHOW',
      tmdbId: 95396,
    });
    expect(mocks.findMany.mock.calls[1][0].where).toMatchObject({
      mediaType: 'EPISODE',
      tmdbId: 1982925,
    });
  });

  it('rejects invalid TMDB ids without querying', async () => {
    const result = await listComments('movie', 0);

    expect(result.success).toBe(false);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('stores new comments against the TMDB id', async () => {
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });
    mocks.create.mockResolvedValue(commentRow);

    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: 'Great episode',
    });

    expect(result.success).toBe(true);
    expect(mocks.findMovie).toHaveBeenCalledWith({
      where: { tmdbId: 550, userId: 'user-1' },
      select: { name: true },
    });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      userId: 'user-1',
      mediaType: 'MOVIE',
      tmdbId: 550,
    });
    expect(mocks.create.mock.calls[0][0].data).not.toHaveProperty('mediaId');
  });

  it('validates the episode TMDB id for episode comments', async () => {
    mocks.findEpisode.mockResolvedValue({ name: 'Test Episode' });
    mocks.create.mockResolvedValue({
      ...commentRow,
      content: 'Episode thoughts',
    });

    await createComment(undefined, {
      mediaType: 'episode',
      tmdbId: 1982925,
      content: 'Episode thoughts',
    });

    expect(mocks.findEpisode).toHaveBeenCalledWith({
      where: { tmdbId: 1982925, season: { show: { userId: 'user-1' } } },
      select: { name: true },
    });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      mediaType: 'EPISODE',
      tmdbId: 1982925,
    });
  });

  it('rejects a comment when the title is not in the viewer library', async () => {
    mocks.findMovie.mockResolvedValue(null);

    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: 'Not in library',
    });

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('resolves ten distinct mentions with one batched lookup and persists ten rows', async () => {
    const users = Array.from({ length: 10 }, (_, index) => ({
      id: `user-${index + 2}`,
      username: `person${index}`,
    }));
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });
    mocks.findUsers.mockResolvedValue(users);
    mocks.create.mockResolvedValue(commentRow);

    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: users.map(({ username }) => `@${username}`).join(' '),
      mentionIds: ['attacker-controlled-id'],
    });

    const createData = mocks.create.mock.calls[0][0].data;
    expect(result.success).toBe(true);
    expect(mocks.findUsers).toHaveBeenCalledTimes(1);
    expect(mocks.findUsers.mock.calls[0][0].where.username.in).toHaveLength(10);
    expect(createData.mentions.createMany.data).toHaveLength(10);
    expect(createData.mentions.createMany.data).toEqual(
      users.map(({ id }) => ({ mentionedUserId: id })),
    );
    expect(createData.notifications.createMany.data).toHaveLength(10);
    expect(createData.notifications.createMany.data).toEqual(
      users.map(({ id }) => ({
        recipientId: id,
        actorId: 'user-1',
        type: 'COMMENT_MENTION',
        mediaType: 'MOVIE',
        tmdbId: 550,
        mediaTitle: 'Test Movie',
      })),
    );
    expect(createData.mentions.createMany.data).not.toContainEqual({
      mentionedUserId: 'attacker-controlled-id',
    });
  });

  it('rejects more than ten distinct mentions before writing anything', async () => {
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });

    const handles = Array.from({ length: 11 }, (_, index) => `@person${index}`).join(' ');
    const result = await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: handles,
    });

    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toMatch(/at most 10/i);
    expect(mocks.findUsers).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('counts repeated handles once against the mention cap', async () => {
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });
    mocks.findUsers.mockResolvedValue([{ id: 'user-2', username: 'person0' }]);
    mocks.create.mockResolvedValue(commentRow);

    // 30 mentions, but only two distinct handles.
    const content = Array.from({ length: 30 }, () => '@person0').join(' ');
    const result = await createComment(undefined, { mediaType: 'movie', tmdbId: 550, content });

    expect(result.success).toBe(true);
    expect(mocks.findUsers.mock.calls[0][0].where.username.in).toEqual(['person0']);
  });

  it('ignores unknown handles and does not create mention or notification rows', async () => {
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });
    mocks.findUsers.mockResolvedValue([]);
    mocks.create.mockResolvedValue(commentRow);

    await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: 'Hello @unknownuser',
    });

    expect(mocks.findUsers).toHaveBeenCalledTimes(1);
    expect(mocks.create.mock.calls[0][0].data.mentions).toBeUndefined();
    expect(mocks.create.mock.calls[0][0].data.notifications).toBeUndefined();
  });

  it('records self-mentions without creating a notification for the author', async () => {
    mocks.findMovie.mockResolvedValue({ name: 'Test Movie' });
    mocks.findUsers.mockResolvedValue([{ id: 'user-1', username: 'viewer' }]);
    mocks.create.mockResolvedValue(commentRow);

    await createComment(undefined, {
      mediaType: 'movie',
      tmdbId: 550,
      content: 'I mention myself @viewer',
    });

    const createData = mocks.create.mock.calls[0][0].data;
    expect(createData.mentions.createMany.data).toEqual([{ mentionedUserId: 'user-1' }]);
    expect(createData.notifications).toBeUndefined();
  });
});
