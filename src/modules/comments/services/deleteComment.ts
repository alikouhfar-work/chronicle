'use action';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';

export type DeleteCommentResult = {
  success: boolean;
  error?: string;
};

export const deleteComment = async (
  commentId: string,
): Promise<DeleteCommentResult> => {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: 'You must be signed in to delete comments.' };
  }

  // Check ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    return { success: false, error: 'Comment not found.' };
  }

  if (comment.userId !== userId) {
    return { success: false, error: 'You are not the author of this comment.' };
  }

  // Soft delete
  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    console.error('deleteComment error:', error);
    return { success: false, error: 'Could not delete comment.' };
  }

  return { success: true };
};