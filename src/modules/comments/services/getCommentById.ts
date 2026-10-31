'use server';

import { prisma } from '@/infra/db/prisma';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { toCommentView } from '@/modules/comments/lib/toCommentView';
import type { GetCommentByIdResult } from '@/modules/comments/types';

export const getCommentById = async (commentId: string): Promise<GetCommentByIdResult> => {
  if (typeof commentId !== 'string' || !commentId.trim()) {
    return { success: false, error: 'Missing comment id.', comment: null };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId.trim() },
      include: {
        user: { select: publicUserSelect },
        attachments: {
          select: { id: true, url: true, mimeType: true, width: true, height: true },
        },
      },
    });

    if (!comment || comment.deletedAt) {
      return { success: false, error: 'Comment not found.', comment: null };
    }

    return { success: true, comment: toCommentView(comment) };
  } catch (error) {
    console.error('getCommentById error:', error);
    return { success: false, error: 'Could not retrieve comment.', comment: null };
  }
};
