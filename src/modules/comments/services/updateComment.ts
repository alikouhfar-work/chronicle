'use action';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';

export type UpdateCommentResult = {
  success: boolean;
  error?: string;
};

export const updateComment = async (
  commentId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<UpdateCommentResult> => {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: 'You must be signed in to edit comments.' };
  }

  // Check ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, content: true },
  });

  if (!comment) {
    return { success: false, error: 'Comment not found.' };
  }

  if (comment.userId !== userId) {
    return { success: false, error: 'You are not the author of this comment.' };
  }

  const content = (formData.get('content') as string).trim();

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