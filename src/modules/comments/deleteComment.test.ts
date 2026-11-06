import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  deleteComment: vi.fn(),
  remove: vi.fn(),
  requireUserId: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    comment: { findUnique: mocks.findUnique, delete: mocks.deleteComment },
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.requireUserId,
}));

vi.mock('@/infra/storage/storage', () => ({
  getCommentStorage: () => ({ kind: 'local', remove: mocks.remove }),
}));

import { deleteComment } from '@/modules/comments/actions/deleteComment';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireUserId.mockResolvedValue('user-1');
  mocks.deleteComment.mockResolvedValue({});
  mocks.remove.mockResolvedValue(undefined);
});

describe('deleteComment', () => {
  it('deletes the row and every attachment object', async () => {
    mocks.findUnique.mockResolvedValue({
      userId: 'user-1',
      attachments: [
        { storageKey: 'comment-attachments/a.png' },
        { storageKey: 'comment-attachments/b.png' },
      ],
    });

    const result = await deleteComment('comment-1');

    expect(result).toEqual({ success: true });
    expect(mocks.deleteComment).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
    expect(mocks.remove).toHaveBeenCalledTimes(2);
    expect(mocks.remove).toHaveBeenCalledWith('comment-attachments/a.png');
  });

  it('removes no objects when the comment had no attachments', async () => {
    mocks.findUnique.mockResolvedValue({ userId: 'user-1', attachments: [] });

    await deleteComment('comment-1');

    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it('refuses to delete another author’s comment', async () => {
    mocks.findUnique.mockResolvedValue({ userId: 'someone-else', attachments: [] });

    const result = await deleteComment('comment-1');

    expect(result.success).toBe(false);
    expect(mocks.deleteComment).not.toHaveBeenCalled();
  });

  it('reports a missing comment', async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await deleteComment('comment-1');

    expect(result).toEqual({ success: false, error: 'Comment not found.' });
    expect(mocks.deleteComment).not.toHaveBeenCalled();
  });

  it('succeeds even when an object delete fails, leaving it to the sweep', async () => {
    mocks.findUnique.mockResolvedValue({
      userId: 'user-1',
      attachments: [{ storageKey: 'comment-attachments/a.png' }],
    });
    mocks.remove.mockRejectedValue(new Error('bucket unavailable'));

    const result = await deleteComment('comment-1');

    expect(result).toEqual({ success: true });
    expect(mocks.deleteComment).toHaveBeenCalled();
  });
});
