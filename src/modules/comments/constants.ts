/** Comment validation + pagination limits (runtime values, not types). */
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
export const DEFAULT_COMMENT_LIMIT = 20;
export const COMMENT_SORT = { createdAt: 'desc' } as const;
