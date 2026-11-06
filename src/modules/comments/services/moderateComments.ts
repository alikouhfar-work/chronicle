import 'server-only';

import { prisma } from '@/infra/db/prisma';
import { APP_MEDIA_TYPE } from '@/modules/comments/lib/validation';
import { COMMENT_HIDDEN_DEFAULT_REASON } from '@/modules/comments/constants';
import { reportReasonFromDb } from '@/modules/comments/lib/reportReason';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';
import { NotFoundError, ValidationError } from '@/shared/lib/errors';
import type {
  ModerationDecisionInput,
  ModerationDecisionResult,
  ModerationQueueItem,
} from '@/modules/comments/types';
import { logError } from '@/infra/logging/logger';

const QUEUE_LIMIT = 50;

/**
 * Reviews that at least one reader flagged and nobody has resolved yet, newest
 * report first. Grouped by review so a moderator decides once per review instead
 * of once per flag.
 */
export const listModerationQueue = async (): Promise<ModerationQueueItem[]> => {
  const reports = await prisma.commentReport.findMany({
    where: { resolvedAt: null },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: QUEUE_LIMIT,
    select: {
      id: true,
      reason: true,
      note: true,
      createdAt: true,
      reporter: { select: { id: true, name: true, username: true } },
      comment: {
        select: {
          id: true,
          content: true,
          mediaType: true,
          tmdbId: true,
          createdAt: true,
          hiddenAt: true,
          hiddenReason: true,
          user: { select: { id: true, name: true, username: true } },
        },
      },
    },
  });

  const byComment = new Map<string, ModerationQueueItem>();

  for (const report of reports) {
    const { comment } = report;
    const existing = byComment.get(comment.id);

    if (existing) {
      existing.reports.push({
        id: report.id,
        reason: reportReasonFromDb(report.reason),
        note: report.note,
        createdAt: report.createdAt,
        reporter: report.reporter,
      });
      continue;
    }

    byComment.set(comment.id, {
      commentId: comment.id,
      content: comment.content,
      mediaType: APP_MEDIA_TYPE[comment.mediaType],
      tmdbId: comment.tmdbId,
      createdAt: comment.createdAt,
      hiddenAt: comment.hiddenAt,
      hiddenReason: comment.hiddenReason,
      author: comment.user,
      reports: [
        {
          id: report.id,
          reason: reportReasonFromDb(report.reason),
          note: report.note,
          createdAt: report.createdAt,
          reporter: report.reporter,
        },
      ],
    });
  }

  return [...byComment.values()];
};

/**
 * Resolve a review's reports. `hide` takes the review out of the public feed and
 * records the reason its author will see; `dismiss` clears the queue and leaves
 * the review up. Both are idempotent: a second decision resolves nothing and
 * reports zero.
 */
export const applyModerationDecision = async (
  input: ModerationDecisionInput,
): Promise<ModerationDecisionResult> => {
  if (input.action !== 'hide' && input.action !== 'dismiss') {
    throw new ValidationError('Unknown moderation action.');
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: input.commentId },
      select: { id: true, mediaType: true, tmdbId: true },
    });

    if (!comment) {
      throw new NotFoundError(`Comment not found: ${input.commentId}`);
    }

    const reason = (input.reason ?? '').trim() || COMMENT_HIDDEN_DEFAULT_REASON;
    const now = new Date();

    const resolvedReports = await prisma.$transaction(async (tx) => {
      if (input.action === 'hide') {
        await tx.comment.update({
          where: { id: comment.id },
          data: { hiddenAt: now, hiddenReason: reason },
        });
      }

      const resolved = await tx.commentReport.updateMany({
        where: { commentId: comment.id, resolvedAt: null },
        data: { resolvedAt: now },
      });

      return resolved.count;
    });

    // The feed is cached per media item; hiding or dismissing has to reach it.
    revalidateMediaDetail(
      comment.mediaType === 'MOVIE' ? 'movie' : 'tv',
      comment.tmdbId,
    );

    return {
      success: true,
      hidden: input.action === 'hide',
      resolvedReports,
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
    logError({ event: 'comment.moderate', action: 'applyModerationDecision', error });
    throw error;
  }
};
