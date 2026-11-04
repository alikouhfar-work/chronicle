import type { CommentAuthor } from '@/modules/comments/types';

export type CommentRecordShape = {
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
