import type { CommentMediaType } from '@/modules/comments/types';

export const NOTIFICATION_LIST_LIMIT = 8;
export const MAX_UNREAD_BADGE = 9;

export type NotificationActor = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
};

export type NotificationItem = {
  id: string;
  isRead: boolean;
  createdAt: Date;
  actor: NotificationActor;
  mediaType: CommentMediaType;
  tmdbId: number;
  /** Snapshot taken at creation time; may be '' when the media is gone. */
  mediaTitle: string;
  commentId: string;
  /** False when the comment was deleted; the bell links to the media page
   * with a notice instead of a comment anchor. */
  commentAvailable: boolean;
  /** Deep link: media/episode route with `#comment-<id>` when available. */
  href: string;
};

export type NotificationListResult = {
  success: boolean;
  error?: string;
  notifications: NotificationItem[];
};

export type UnreadCountResult = {
  success: boolean;
  error?: string;
  unreadCount: number;
};

export type MarkReadResult = {
  success: boolean;
  error?: string;
};
