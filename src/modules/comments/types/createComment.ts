import type { CommentAttachmentInput, CommentMediaType } from '@/modules/comments/types';

export type CreateCommentInput = {
  mediaType: CommentMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
  content: string;
  attachments?: CommentAttachmentInput[];
  /** Client hint only; server-side content extraction is authoritative. */
  mentionIds?: string[];
};
