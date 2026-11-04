'use server';

import { prisma } from '@/infra/db/prisma';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { toCommentView } from '@/modules/comments/lib/toCommentView';
import { PRISMA_MEDIA_TYPE, isCommentMediaType, isTmdbId } from '@/modules/comments/lib/validation';
import { DEFAULT_COMMENT_LIMIT } from '@/modules/comments/constants';
import type {
  CommentCursor,
  CommentMediaType,
  ListCommentsResult,
} from '@/modules/comments/types';

const MAX_LIMIT = 50;

const normalizeCursor = (cursor?: CommentCursor | string): CommentCursor | undefined => {
  if (!cursor) return undefined;
  if (typeof cursor === 'string') {
    const parsed = new Date(cursor);
    return Number.isNaN(parsed.getTime()) ? undefined : { createdAt: parsed, id: '' };
  }
  return cursor;
};

export const listComments = async (
  mediaType: CommentMediaType,
  tmdbId: number,
  cursor?: CommentCursor,
  limit: number = DEFAULT_COMMENT_LIMIT,
): Promise<ListCommentsResult> => {
  if (!isCommentMediaType(mediaType) || !isTmdbId(tmdbId)) {
    return { success: false, error: 'Invalid media reference.', comments: [], hasMore: false };
  }

  const pageSize = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
  const safeCursor = normalizeCursor(cursor);

  const where: Record<string, unknown> = {
    mediaType: PRISMA_MEDIA_TYPE[mediaType],
    tmdbId,
    deletedAt: null,
  };

  if (safeCursor) {
    where.OR = [
      { createdAt: { lt: safeCursor.createdAt } },
      { createdAt: { equals: safeCursor.createdAt }, id: { lt: safeCursor.id } },
    ];
  }

  try {
    const commentRows = await prisma.comment.findMany({
      where: where as never,
      include: {
        user: { select: publicUserSelect },
        attachments: {
          select: { id: true, url: true, mimeType: true, width: true, height: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: pageSize + 1,
    });

    // One extra row is fetched to detect whether another page exists.
    const hasMore = commentRows.length > pageSize;
    const pageRows = hasMore ? commentRows.slice(0, pageSize) : commentRows;
    const lastRow = pageRows.at(-1);

    return {
      success: true,
      comments: pageRows.map(toCommentView),
      hasMore,
      nextCursor:
        hasMore && lastRow ? { createdAt: lastRow.createdAt, id: lastRow.id } : undefined,
    };
  } catch (error) {
    console.error('listComments error:', error);
    return {
      success: false,
      error: 'Could not load reviews. Please try again.',
      comments: [],
      hasMore: false,
    };
  }
};
