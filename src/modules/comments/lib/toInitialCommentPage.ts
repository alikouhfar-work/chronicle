import 'server-only';

import type { ListCommentsResult } from '@/modules/comments/types';
import type { InitialCommentPage } from '@/modules/comments/types/initialCommentPage';

const EMPTY_PAGE: InitialCommentPage = { comments: [], hasMore: false };

/**
 * Normalizes a failed/empty `listComments` result into a safe first page so
 * Server Components can always hand the client a usable payload.
 */
export const toInitialCommentPage = (result: ListCommentsResult): InitialCommentPage =>
  result.success
    ? { comments: result.comments, hasMore: result.hasMore, nextCursor: result.nextCursor }
    : EMPTY_PAGE;
