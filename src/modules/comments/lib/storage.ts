// Comment-specific storage helpers.

export {
  COMMENT_ATTACHMENT_PREFIX,
  COMMENT_MAX_ATTACHMENT_SIZE_BYTES,
  COMMENT_MAX_ATTACHMENTS_PER_COMMENT,
  COMMENT_STORAGE_MIME_TYPES,
  getCommentStorage,
  isCommentAttachmentKey,
  isCommentAttachmentUrl,
} from '@/infra/storage/storage';
export type { StorageKind, StorageProvider } from '@/infra/storage/storage';
