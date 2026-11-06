import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError, ValidationError } from '@/shared/lib/errors';

const mocks = vi.hoisted(() => ({
  userId: vi.fn(),
  auth: vi.fn(),
  commentFindUnique: vi.fn(),
  commentFindMany: vi.fn(),
  commentUpdate: vi.fn(),
  reportCreate: vi.fn(),
  reportFindMany: vi.fn(),
  reportUpdateMany: vi.fn(),
  transaction: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    comment: {
      findUnique: mocks.commentFindUnique,
      findMany: mocks.commentFindMany,
      update: mocks.commentUpdate,
    },
    commentReport: {
      create: mocks.reportCreate,
      findMany: mocks.reportFindMany,
      updateMany: mocks.reportUpdateMany,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({ requireUserId: mocks.userId }));
vi.mock('@/infra/auth/auth', () => ({ auth: mocks.auth }));
vi.mock('@/shared/lib/revalidate', () => ({ revalidateMediaDetail: mocks.revalidate }));

import { reportComment } from '@/modules/comments/actions/reportComment';
import { listComments } from '@/modules/comments/services/listComments';
import {
  applyModerationDecision,
  listModerationQueue,
} from '@/modules/comments/services/moderateComments';

const uniqueViolation = () => Object.assign(new Error('duplicate'), { code: 'P2002' });

describe('comment moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userId.mockResolvedValue('reporter-1');
    mocks.auth.mockResolvedValue({ user: { id: 'reporter-1' } });
    // The transaction client is the same mock surface as `prisma` for these tests.
    mocks.transaction.mockImplementation(async (run: (tx: unknown) => unknown) =>
      run({
        comment: { update: mocks.commentUpdate },
        commentReport: { updateMany: mocks.reportUpdateMany },
      }),
    );
    mocks.commentUpdate.mockResolvedValue({});
    mocks.reportUpdateMany.mockResolvedValue({ count: 2 });
  });

  describe('reportComment', () => {
    it('writes one report with the database enum value', async () => {
      mocks.commentFindUnique.mockResolvedValue({ id: 'comment-1', userId: 'author-1', hiddenAt: null });
      mocks.reportCreate.mockResolvedValue({ id: 'report-1' });

      const result = await reportComment({ commentId: 'comment-1', reason: 'off_topic', note: '  meh  ' });

      expect(result).toEqual({ success: true });
      expect(mocks.reportCreate).toHaveBeenCalledWith({
        data: {
          commentId: 'comment-1',
          reporterId: 'reporter-1',
          reason: 'OFF_TOPIC',
          note: 'meh',
        },
      });
    });

    it('treats a second report by the same reader as done, not as an error', async () => {
      mocks.commentFindUnique.mockResolvedValue({ id: 'comment-1', userId: 'author-1', hiddenAt: null });
      mocks.reportCreate.mockRejectedValue(uniqueViolation());

      expect(await reportComment({ commentId: 'comment-1', reason: 'spam' })).toEqual({
        success: true,
        alreadyReported: true,
      });
    });

    it('refuses to report your own review', async () => {
      mocks.commentFindUnique.mockResolvedValue({ id: 'comment-1', userId: 'reporter-1', hiddenAt: null });

      const result = await reportComment({ commentId: 'comment-1', reason: 'spam' });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/your own review/i);
      expect(mocks.reportCreate).not.toHaveBeenCalled();
    });

    it('rejects an unknown reason and an over-long note before writing', async () => {
      const badReason = await reportComment({
        commentId: 'comment-1',
        reason: 'not-a-reason' as never,
      });
      expect(badReason.success).toBe(false);

      const longNote = await reportComment({
        commentId: 'comment-1',
        reason: 'spam',
        note: 'x'.repeat(501),
      });
      expect(longNote.success).toBe(false);
      expect(mocks.reportCreate).not.toHaveBeenCalled();
    });

    it('reports success for an already-hidden review without writing', async () => {
      mocks.commentFindUnique.mockResolvedValue({
        id: 'comment-1',
        userId: 'author-1',
        hiddenAt: new Date(),
      });

      expect(await reportComment({ commentId: 'comment-1', reason: 'spam' })).toEqual({
        success: true,
      });
      expect(mocks.reportCreate).not.toHaveBeenCalled();
    });

    it('requires a session', async () => {
      mocks.userId.mockRejectedValue(new Error('Unauthorized'));

      expect((await reportComment({ commentId: 'comment-1', reason: 'spam' })).success).toBe(false);
    });
  });

  describe('listModerationQueue', () => {
    it('groups every open report under its review', async () => {
      const comment = {
        id: 'comment-1',
        content: 'Buy my course',
        mediaType: 'MOVIE',
        tmdbId: 550,
        createdAt: new Date('2026-11-01T10:00:00Z'),
        hiddenAt: null,
        hiddenReason: null,
        user: { id: 'author-1', name: 'Author', username: 'author' },
      };
      mocks.reportFindMany.mockResolvedValue([
        {
          id: 'report-1',
          reason: 'SPAM',
          note: 'link farming',
          createdAt: new Date('2026-11-02T10:00:00Z'),
          reporter: { id: 'reporter-1', name: null, username: 'r1' },
          comment,
        },
        {
          id: 'report-2',
          reason: 'OFF_TOPIC',
          note: null,
          createdAt: new Date('2026-11-02T11:00:00Z'),
          reporter: { id: 'reporter-2', name: null, username: 'r2' },
          comment,
        },
      ]);

      const queue = await listModerationQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0]?.commentId).toBe('comment-1');
      expect(queue[0]?.mediaType).toBe('movie');
      expect(queue[0]?.reports.map((report) => report.reason)).toEqual(['spam', 'off_topic']);
      expect(mocks.reportFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { resolvedAt: null } }),
      );
    });
  });

  describe('applyModerationDecision', () => {
    beforeEach(() => {
      mocks.commentFindUnique.mockResolvedValue({
        id: 'comment-1',
        mediaType: 'MOVIE',
        tmdbId: 550,
      });
    });

    it('hides the review with the reason its author will read, and resolves the reports', async () => {
      const result = await applyModerationDecision({
        commentId: 'comment-1',
        action: 'hide',
        reason: 'Advertising.',
      });

      expect(result).toMatchObject({ success: true, hidden: true, resolvedReports: 2 });
      expect(mocks.commentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment-1' },
          data: expect.objectContaining({ hiddenReason: 'Advertising.' }),
        }),
      );
      expect(mocks.reportUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { commentId: 'comment-1', resolvedAt: null } }),
      );
      expect(mocks.revalidate).toHaveBeenCalledWith('movie', 550);
    });

    it('falls back to the default reason when none is given', async () => {
      await applyModerationDecision({ commentId: 'comment-1', action: 'hide' });

      expect(mocks.commentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ hiddenReason: expect.stringMatching(/hidden/i) }),
        }),
      );
    });

    it('dismisses without touching the review', async () => {
      const result = await applyModerationDecision({ commentId: 'comment-1', action: 'dismiss' });

      expect(result).toMatchObject({ success: true, hidden: false, resolvedReports: 2 });
      expect(mocks.commentUpdate).not.toHaveBeenCalled();
    });

    it('rejects an unknown action and a missing review', async () => {
      await expect(
        applyModerationDecision({ commentId: 'comment-1', action: 'delete' as never }),
      ).rejects.toBeInstanceOf(ValidationError);

      mocks.commentFindUnique.mockResolvedValue(null);
      await expect(
        applyModerationDecision({ commentId: 'comment-1', action: 'hide' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('listComments visibility', () => {
    it('asks for visible rows plus the viewer’s own hidden ones', async () => {
      mocks.commentFindMany.mockResolvedValue([]);

      await listComments('movie', 550);

      expect(mocks.commentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [{ OR: [{ hiddenAt: null }, { userId: 'reporter-1' }] }],
          }),
        }),
      );
    });

    it('filters hidden rows entirely for a signed-out reader', async () => {
      mocks.auth.mockResolvedValue(null);
      mocks.commentFindMany.mockResolvedValue([]);

      await listComments('movie', 550);

      expect(mocks.commentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ AND: [{ hiddenAt: null }] }),
        }),
      );
    });
  });
});
