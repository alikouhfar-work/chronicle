import type { CommentReportReason } from '@/modules/comments/constants';

export type CommentMediaType = 'episode' | 'show' | 'movie';


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
  /**
   * Moderation state. Only the author ever receives a hidden comment (the feed
   * filters it out for everyone else), and the reason is there so the author can
   * see why it is gone.
   */
  hidden?: boolean;
  hiddenReason?: string | null;
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
  /** Present on success so the feed can swap the edited node in place. */
  comment?: CommentView;
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

export type ReportCommentInput = {
  commentId: string;
  reason: CommentReportReason;
  note?: string;
};

export type ReportCommentResult = {
  success: boolean;
  error?: string;
  /** The reader had already reported this review; nothing was written twice. */
  alreadyReported?: boolean;
};

/** One review in the moderation queue, with every unresolved report on it. */
export type ModerationQueueItem = {
  commentId: string;
  content: string;
  mediaType: CommentMediaType;
  tmdbId: number;
  createdAt: Date;
  hiddenAt: Date | null;
  hiddenReason: string | null;
  author: { id: string; name: string | null; username: string | null };
  reports: Array<{
    id: string;
    reason: CommentReportReason;
    note: string | null;
    createdAt: Date;
    reporter: { id: string; name: string | null; username: string | null };
  }>;
};

export type ModerationDecisionInput = {
  commentId: string;
  action: 'hide' | 'dismiss';
  /** Shown to the author when the review is hidden. */
  reason?: string;
};

export type ModerationDecisionResult = {
  success: boolean;
  error?: string;
  hidden?: boolean;
  resolvedReports?: number;
};
