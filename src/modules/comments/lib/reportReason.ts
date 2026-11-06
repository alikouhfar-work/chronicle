import { CommentReportReason as DbCommentReportReason } from '../../../../generated/prisma/enums';
import type { CommentReportReason } from '@/modules/comments/constants';

/**
 * The database enum returns Prisma names (`SPAM`), the app speaks lower-case
 * values (`spam`) — the same split as `PRISMA_MEDIA_TYPE`/`APP_MEDIA_TYPE`, kept
 * in one place so a new reason cannot be added to one side only.
 */
export const REPORT_REASON_TO_DB: Record<CommentReportReason, DbCommentReportReason> = {
  spam: DbCommentReportReason.SPAM,
  abuse: DbCommentReportReason.ABUSE,
  off_topic: DbCommentReportReason.OFF_TOPIC,
  other: DbCommentReportReason.OTHER,
};

/** Prisma enum name (`OFF_TOPIC`) or its stored label (`off_topic`) -> app value. */
export const reportReasonFromDb = (value: string): CommentReportReason =>
  value.toLowerCase() as CommentReportReason;
