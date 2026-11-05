import 'server-only';

import {
  COMMENT_DAILY_UPLOAD_LIMIT,
  COMMENT_MAX_ATTACHMENT_SIZE_BYTES,
  COMMENT_USER_QUOTA_BYTES,
} from '@/infra/storage/storage';
import { getAttachmentUsage } from '@/modules/comments/services/getAttachmentUsage';

export type QuotaDecision = { ok: true } | { ok: false; error: string };

const megabytes = (bytes: number) => Math.round(bytes / (1024 * 1024));

/**
 * Enforces the per-account attachment budget before an upload is stored:
 * total bytes plus one more maximum-sized object, and a rolling daily count.
 */
export const checkAttachmentQuota = async (userId: string): Promise<QuotaDecision> => {
  const usage = await getAttachmentUsage(userId);

  if (usage.totalBytes + COMMENT_MAX_ATTACHMENT_SIZE_BYTES > COMMENT_USER_QUOTA_BYTES) {
    return {
      ok: false,
      error: `Attachment storage limit reached (${megabytes(
        COMMENT_USER_QUOTA_BYTES,
      )} MB per account). Delete a comment with images to free space.`,
    };
  }

  if (usage.uploadsLastDay >= COMMENT_DAILY_UPLOAD_LIMIT) {
    return { ok: false, error: 'Too many uploads today. Try again tomorrow.' };
  }

  return { ok: true };
};
