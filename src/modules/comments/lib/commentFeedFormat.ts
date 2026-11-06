import { format, formatDistanceToNow } from 'date-fns';
import type { CommentAttachment } from '@/modules/comments/types/commentAttachment';
import type { CommentView } from '@/modules/comments/types';

/** Relative/absolute timestamps for the review feed, tolerant of bad input. */
export const relativeTime = (value: Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true });
};

export const absoluteTime = (value: Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPpp');
};

/** The grid only needs identity, url and type — not the stored dimensions. */
export const toGridAttachments = (comment: CommentView): CommentAttachment[] =>
  comment.attachments.map((attachment) => ({
    id: attachment.id,
    url: attachment.url,
    mimeType: attachment.mimeType,
  }));
