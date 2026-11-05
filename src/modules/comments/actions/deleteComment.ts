'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { getCommentStorage } from '@/infra/storage/storage';
import type { DeleteCommentResult } from '@/modules/comments/types';
import { logError } from '@/infra/logging/logger';

/**
 * Permanently deletes a comment: the row goes (cascading its mentions,
 * notifications and attachment rows) and its images are removed from storage.
 * There is no soft-delete state for comments — delete means delete.
 */
export const deleteComment = async (commentId: string): Promise<DeleteCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to delete comments.' };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      attachments: { select: { storageKey: true } },
    },
  });

  if (!comment) {
    return { success: false, error: 'Comment not found.' };
  }

  if (comment.userId !== userId) {
    return { success: false, error: 'You are not the author of this comment.' };
  }

  const storageKeys = comment.attachments.map((attachment) => attachment.storageKey);

  try {
    await prisma.comment.delete({ where: { id: commentId } });
  } catch (error) {
    logError({ event: 'comment.delete', action: 'deleteComment', error });
    return { success: false, error: 'Could not delete comment.' };
  }

  // Objects are removed after the row: a failed delete leaves an orphan that the
  // attachment sweep collects, which beats failing the user's delete.
  if (storageKeys.length > 0) {
    const storage = getCommentStorage();
    await Promise.all(
      storageKeys.map((key) =>
        storage.remove(key).catch((error: unknown) => {
          logError({ event: 'comment.delete.storage', action: 'deleteComment', error });
        }),
      ),
    );
  }

  return { success: true };
};
