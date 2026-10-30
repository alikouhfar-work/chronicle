export type MediaType = 'episode' | 'show' | 'movie';

export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
export const DEFAULT_COMMENT_LIMIT = 20;
export const COMMENT_SORT = { createdAt: 'desc' } as const;

export type CommentCursor = {
  createdAt: Date;
  id: string;
};

export type CommentWithAuthor = {
  id: string;
  content: string;
  authorUsername: string | null;
  authorName: string | null;
  authorImage: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  attachments: Array<{ url: string }>;
};

export type CreateCommentResult = {
  success: boolean;
  error?: string;
};

export type UpdateCommentResult = {
  success: boolean;
  error?: string;
};

export type DeleteCommentResult = {
  success: boolean;
  error?: string;
};

export type ListCommentsResult = {
  success: boolean;
  error?: string;
  comments: CommentWithAuthor[];
  nextCursor?: { createdAt: Date; id: string };
  hasMore: boolean;
};

export type GetCommentByIdResult = {
  success: boolean;
  error?: string;
  comment: CommentWithAuthor | null;
};