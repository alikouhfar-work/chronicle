export type NotificationRow = {
  id: string;
  isRead: boolean;
  createdAt: Date;
  recipientId: string;
  actor: { id: string; username: string | null; name: string | null; image: string | null };
  mediaType: string;
  tmdbId: number;
  mediaTitle: string;
  commentId: string;
  comment: { id: string } | null;
};
