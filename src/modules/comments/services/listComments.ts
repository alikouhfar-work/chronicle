'use action';

import { prisma } from '@/infra/db/prisma';

export type ListCommentsResult = {
  success: boolean;
  error?: string;
  comments: Array<{
    id: string;
    content: string;
    authorUsername: string | null;
    authorName: string | null;
    authorImage: string | null;
    createdAt: Date;
    deletedAt: Date | null;
    attachments: Array<{ url: string }>;
  }>;
  nextCursor?: { createdAt: Date; id: string };
  hasMore: boolean;
};

const DEFAULT_LIMIT = 20;

export const listComments = async (
  mediaType: string,
  mediaId: string,
  cursor?: { createdAt: Date; id: string },
  limit: number = DEFAULT_LIMIT,
): Promise<ListCommentsResult> => {
  const where: Record<string, unknown> = {
    mediaType,
    mediaId,
    deletedAt: null,
  };

  if (cursor) {
    where.OR = [
      { createdAt: { lt: cursor.createdAt } },
      { createdAt: { equals: cursor.createdAt }, id: { lt: cursor.id } },
    ];
  }

  const items = await prisma.comment.findMany({
    where: where as never,
    include: {
      user: { select: { username: true, name: true, image: true } },
      attachments: { select: { url: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const comments = items.map((c) => ({
    id: c.id,
    content: c.content,
    authorUsername: c.user.username,
    authorName: c.user.name,
    authorImage: c.user.image,
    createdAt: c.createdAt,
    deletedAt: c.deletedAt,
    attachments: c.attachments.map((a) => ({ url: a.url })),
  }));

  const hasMore = comments.length > limit;
  const page = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore
    ? { createdAt: page[page.length - 1].createdAt, id: page[page.length - 1].id }
    : undefined;

  return {
    success: true,
    comments: page,
    nextCursor,
    hasMore: !!hasMore,
  };
};