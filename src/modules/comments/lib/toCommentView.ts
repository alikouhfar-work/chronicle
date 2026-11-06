import type { CommentAttachmentView, CommentView } from '@/modules/comments/types';
import type { CommentRecordShape } from '@/modules/comments/types/commentRecordShape';

export const toCommentAttachmentView = (attachment: {
  id: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
}): CommentAttachmentView => ({
  id: attachment.id,
  url: attachment.url,
  mimeType: attachment.mimeType,
  width: attachment.width,
  height: attachment.height,
});

/**
 * Converts a Prisma comment row (with its public author + attachments) into
 * the serializable shape consumed by the review feed. Public payloads only
 * ever expose the author fields already selected by `publicUserSelect`.
 */
export const toCommentView = (comment: CommentRecordShape): CommentView => ({
  id: comment.id,
  content: comment.content,
  createdAt: comment.createdAt,
  author: comment.user,
  attachments: comment.attachments.map(toCommentAttachmentView),
  // Only present when the row is hidden; the client renders a notice for the
  // author instead of dropping their own review without explanation.
  hidden: Boolean(comment.hiddenAt),
  hiddenReason: comment.hiddenAt ? (comment.hiddenReason ?? null) : null,
});
