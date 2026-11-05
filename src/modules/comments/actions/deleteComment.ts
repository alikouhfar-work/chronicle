'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { DeleteCommentResult } from '@/modules/comments/types';
import { logError } from '@/infra/logging/logger';

export const deleteComment = async (commentId: string): Promise<DeleteCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to delete comments.' };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, deletedAt: true },
  });

  if (!comment || comment.deletedAt) {
    return { success: false, error: 'Comment not found.' };
  }

  if (comment.userId !== userId) {
    return { success: false, error: 'You are not the author of this comment.' };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logError({ event: 'comment.delete', action: 'deleteComment', error });
    return { success: false, error: 'Could not delete comment.' };
  }

  return { success: true };
};
