import { beforeEach, describe, expect, it, vi } from 'vitest';

const tx = {
  commentMention: { deleteMany: vi.fn(), createMany: vi.fn() },
  notification: { deleteMany: vi.fn(), createMany: vi.fn() },
  comment: { update: vi.fn() },
};

const mocks = vi.hoisted(() => ({
  findComment: vi.fn(),
  findNotification: vi.fn(),
  findUsers: vi.fn(),
  findMovie: vi.fn(),
  requireUserId: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    comment: { findUnique: mocks.findComment },
    notification: { findFirst: mocks.findNotification },
    user: { findMany: mocks.findUsers },
    movie: { findFirst: mocks.findMovie },
    $transaction: async (handler: (client: unknown) => Promise<unknown>) => handler(tx),
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.requireUserId,
}));

import { updateComment } from '@/modules/comments/actions/updateComment';

const commentRow = {
  userId: 'user-1',
  deletedAt: null,
  mediaType: 'MOVIE' as const,
  tmdbId: 550,
};

const updatedRow = {
  id: 'comment-1',
  content: 'Edited @bob',
  createdAt: new Date('2026-11-01T10:00:00Z'),
  deletedAt: null,
  user: { id: 'user-1', username: 'viewer', name: 'Viewer', image: null },
  attachments: [],
};

describe('updateComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue('user-1');
    mocks.findComment.mockResolvedValue(commentRow);
    mocks.findNotification.mockResolvedValue({ mediaTitle: 'Fight Club' });
    mocks.findUsers.mockResolvedValue([{ id: 'user-2', username: 'bob' }]);
    tx.comment.update.mockResolvedValue(updatedRow);
  });

  it('re-derives mentions from the edited text instead of trusting the client', async () => {
    const result = await updateComment('comment-1', { content: 'Edited @bob' });

    expect(result.success).toBe(true);
    expect(result.comment?.content).toBe('Edited @bob');

    // Old mentions and notifications are cleared first.
    expect(tx.commentMention.deleteMany).toHaveBeenCalledWith({ where: { commentId: 'comment-1' } });
    expect(tx.commentMention.createMany).toHaveBeenCalledWith({
      data: [{ commentId: 'comment-1', mentionedUserId: 'user-2' }],
    });

    // The rendered text, not a client-provided id, decides who is notified.
    expect(mocks.findUsers).toHaveBeenCalledWith({
      where: { username: { in: ['bob'], mode: 'insensitive' } },
      select: { id: true, username: true },
    });
    expect(tx.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          recipientId: 'user-2',
          actorId: 'user-1',
          commentId: 'comment-1',
          mediaType: 'MOVIE',
          tmdbId: 550,
          mediaTitle: 'Fight Club',
        }),
      ],
      skipDuplicates: true,
    });
  });

  it('drops notifications for handles that were removed from the text', async () => {
    mocks.findUsers.mockResolvedValue([]);

    await updateComment('comment-1', { content: 'No mentions now' });

    expect(tx.notification.deleteMany).toHaveBeenCalledWith({
      where: { commentId: 'comment-1', recipientId: { notIn: [] } },
    });
    expect(tx.notification.createMany).not.toHaveBeenCalled();
  });

  it('never notifies the author about their own mention', async () => {
    mocks.findUsers.mockResolvedValue([{ id: 'user-1', username: 'viewer' }]);

    await updateComment('comment-1', { content: 'Note to @viewer' });

    expect(tx.commentMention.createMany).toHaveBeenCalledWith({
      data: [{ commentId: 'comment-1', mentionedUserId: 'user-1' }],
    });
    expect(tx.notification.createMany).not.toHaveBeenCalled();
  });

  it('rejects edits from anyone but the author', async () => {
    mocks.findComment.mockResolvedValue({ ...commentRow, userId: 'user-2' });

    const result = await updateComment('comment-1', { content: 'Hijacked' });

    expect(result.success).toBe(false);
    expect(tx.comment.update).not.toHaveBeenCalled();
  });

  it('treats a missing comment as missing', async () => {
    mocks.findComment.mockResolvedValue(null);

    const result = await updateComment('comment-1', { content: 'Zombie edit' });

    expect(result.success).toBe(false);
    expect(tx.comment.update).not.toHaveBeenCalled();
  });

  it('validates length before writing', async () => {
    const result = await updateComment('comment-1', { content: '   ' });

    expect(result.success).toBe(false);
    expect(mocks.findComment).toHaveBeenCalled();
    expect(tx.comment.update).not.toHaveBeenCalled();
  });
});
