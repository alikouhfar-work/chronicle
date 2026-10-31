import type { CommentAttachmentView, CommentAuthor, CommentView } from '@/modules/comments/types';

type CommentRecordShape = {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentAuthor;
  attachments: Array<{
    id: string;
    url: string;
    mimeType: string;
    width: number | null;
    height: number | null;
  }>;
  deletedAt?: Date | null;
};

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
});
