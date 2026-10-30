'use action';

import { prisma } from '@/infra/db/prisma';

export type GetCommentByIdResult = {
  success: boolean;
  error?: string;
  comment: {
    id: string;
    content: string;
    authorUsername: string | null;
    authorName: string | null;
    authorImage: string | null;
    createdAt: Date;
    deletedAt: Date | null;
    attachments: Array<{ url: string }>;
  } | null;
};

export const getCommentById = async (
  commentId: string,
): Promise<GetCommentByIdResult> => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: { select: { username: true, name: true, image: true } },
        attachments: { select: { url: true } },
      },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found.', comment: null };
    }

    // Return null comment if soft-deleted
    if (comment.deletedAt) {
      return {
        success: true,
        comment: null,
      };
    }

    const authorUsername = comment.user?.username ?? null;
    const authorName = comment.user?.name ?? null;
    const authorImage = comment.user?.image ?? null;

    return {
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        authorUsername,
        authorName,
        authorImage,
        createdAt: comment.createdAt,
        deletedAt: comment.deletedAt,
        attachments: comment.attachments?.map((a) => ({ url: a.url })) ?? [],
      },
    };
  } catch (error) {
    console.error('getCommentById error:', error);
    return { success: false, error: 'Could not retrieve comment.', comment: null };
  }
};