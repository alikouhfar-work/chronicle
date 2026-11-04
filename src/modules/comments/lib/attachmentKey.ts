import { randomUUID } from 'node:crypto';
import { COMMENT_ATTACHMENT_PREFIX } from '@/infra/storage/storage';
import type { CommentMimeType } from '@/modules/comments/types/commentMimeType';

const EXTENSION_BY_MIME: Record<CommentMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const extensionForMime = (mimeType: CommentMimeType): string => EXTENSION_BY_MIME[mimeType];

const sanitizeBaseName = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

/**
 * Object key for a comment attachment: `comment-attachments/<ts>-<uuid>-<name>.<ext>`.
 * The UUID guarantees uniqueness; the timestamp keeps listings chronological.
 */
export const buildCommentAttachmentKey = (params: {
  fileName: string;
  mimeType: CommentMimeType;
  now?: number;
  uuid?: string;
}): string => {
  const timestamp = params.now ?? Date.now();
  const uuid = params.uuid ?? randomUUID();
  const baseName = sanitizeBaseName(params.fileName) || 'image';

  return `${COMMENT_ATTACHMENT_PREFIX}/${timestamp}-${uuid}-${baseName}.${extensionForMime(params.mimeType)}`;
};
