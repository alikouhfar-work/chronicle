/** Comment validation + pagination limits (runtime values, not types). */
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
/** Distinct @handles one comment may ping; each one creates a notification. */
export const COMMENT_MAX_MENTIONS = 10;
export const DEFAULT_COMMENT_LIMIT = 20;
export const COMMENT_SORT = { createdAt: 'desc' } as const;

/** Reasons a reader can pick when reporting a review. */
export const COMMENT_REPORT_REASONS = ['spam', 'abuse', 'off_topic', 'other'] as const;
export type CommentReportReason = (typeof COMMENT_REPORT_REASONS)[number];

export const COMMENT_REPORT_REASON_LABELS: Record<CommentReportReason, string> = {
  spam: 'Spam or advertising',
  abuse: 'Harassment or abuse',
  off_topic: 'Off topic',
  other: 'Something else',
};

/** Optional free-text detail on a report; short by design. */
export const COMMENT_REPORT_NOTE_MAX_LENGTH = 500;
/** What the author sees when their review is hidden. */
export const COMMENT_HIDDEN_DEFAULT_REASON = 'This review was hidden after a moderation report.';

/** Review feed page size (shared by the initial read and the load-more call). */
export const COMMENT_REVIEW_PAGE_SIZE = 20;
/** What the composer accepts before the server sniffs the bytes. */
export const COMMENT_ALLOWED_IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
export const COMMENT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
