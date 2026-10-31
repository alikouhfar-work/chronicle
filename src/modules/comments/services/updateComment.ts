'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import {
  COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
  type UpdateCommentResult,
} from '@/modules/comments/types';

export const updateComment = async (
  commentId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<UpdateCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to edit comments.' };
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

  const raw = formData.get('content');
  const content = typeof raw === 'string' ? raw.trim() : '';
  if (content.length < COMMENT_MIN_LENGTH || content.length > COMMENT_MAX_LENGTH) {
    return {
      success: false,
      error: `Comment must be between ${COMMENT_MIN_LENGTH} and ${COMMENT_MAX_LENGTH} characters.`,
    };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  } catch (error) {
    console.error('updateComment error:', error);
    return { success: false, error: 'Could not update comment.' };
  }

  return { success: true };
};
