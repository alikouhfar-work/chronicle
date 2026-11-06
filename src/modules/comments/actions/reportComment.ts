'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import {
  COMMENT_REPORT_NOTE_MAX_LENGTH,
  COMMENT_REPORT_REASONS,
  type CommentReportReason,
} from '@/modules/comments/constants';
import { REPORT_REASON_TO_DB } from '@/modules/comments/lib/reportReason';
import type { ReportCommentInput, ReportCommentResult } from '@/modules/comments/types';
import { logError } from '@/infra/logging/logger';
import { parseDbId } from '@/shared/lib/validate';

const isReportReason = (value: unknown): value is CommentReportReason =>
  typeof value === 'string' && (COMMENT_REPORT_REASONS as readonly string[]).includes(value);

/**
 * Flag a public review for moderation. One report per reader per review — a
 * second attempt is a no-op rather than a second queue entry, and a reader can
 * never report their own review (that is what editing or deleting is for).
 */
export const reportComment = async (input: ReportCommentInput): Promise<ReportCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to report a review.' };
  }

  let commentId: string;
  try {
    commentId = parseDbId(input?.commentId, 'commentId');
  } catch {
    return { success: false, error: 'Missing review id.' };
  }

  if (!isReportReason(input?.reason)) {
    return { success: false, error: 'Choose a reason for the report.' };
  }

  const note = (input.note ?? '').trim();
  if (note.length > COMMENT_REPORT_NOTE_MAX_LENGTH) {
    return {
      success: false,
      error: `A report note must be ${COMMENT_REPORT_NOTE_MAX_LENGTH} characters or fewer.`,
    };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, hiddenAt: true },
    });

    if (!comment) {
      return { success: false, error: 'That review no longer exists.' };
    }

    if (comment.userId === userId) {
      return { success: false, error: 'You cannot report your own review.' };
    }

    // Already hidden: the report adds nothing, but failing would look like a bug
    // to the reader, so treat it as done.
    if (comment.hiddenAt) {
      return { success: true };
    }

    await prisma.commentReport.create({
      data: {
        commentId,
        reporterId: userId,
        reason: REPORT_REASON_TO_DB[input.reason],
        note: note.length > 0 ? note : null,
      },
    });

    return { success: true };
  } catch (error) {
    // Unique (commentId, reporterId): the reader reported it before.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return { success: true, alreadyReported: true };
    }

    logError({ event: 'comment.report', action: 'reportComment', error });
    return { success: false, error: 'Could not send the report. Please try again.' };
  }
};
