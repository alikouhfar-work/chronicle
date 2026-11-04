import type { CommentCursor, CommentView } from '@/modules/comments/types';

/**
 * First page of the public review feed, loaded by a Server Component so the
 * client panel only owns pagination + optimistic writes.
 */
export type InitialCommentPage = {
  comments: CommentView[];
  hasMore: boolean;
  nextCursor?: CommentCursor;
};
