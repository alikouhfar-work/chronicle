export type CommentMediaType = 'episode' | 'show' | 'movie';

export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
export const DEFAULT_COMMENT_LIMIT = 20;
export const COMMENT_SORT = { createdAt: 'desc' } as const;

export type CommentAuthor = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
};

export type CommentAttachmentView = {
  id: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export type CommentView = {
  id: string;
  content: string;
  createdAt: Date;
  author: CommentAuthor;
  attachments: CommentAttachmentView[];
  /** Client-only flag for optimistic entries. */
  pending?: boolean;
};

export type CommentCursor = {
  createdAt: Date;
  id: string;
};

/** Uploaded file that has not been attached to a comment yet. */
export type CommentAttachmentInput = {
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
};

export type PendingCommentAttachment = CommentAttachmentInput & {
  id: string;
};

export type CommentMediaReference = {
  mediaType: CommentMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
};

export type CreateCommentResult = {
  success: boolean;
  error?: string;
  comment?: CommentView;
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
  comments: CommentView[];
  nextCursor?: CommentCursor;
  hasMore: boolean;
};

export type GetCommentByIdResult = {
  success: boolean;
  error?: string;
  comment: CommentView | null;
};
