export { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
export { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';
export { PersonalNotesPanel } from '@/modules/comments/components/PersonalNotesPanel';
export { PublicReviewsPanel } from '@/modules/comments/components/PublicReviewsPanel';
export { getCommentViewer } from '@/modules/comments/queries/getCommentViewer';

export {
  createComment,
  updateComment,
  deleteComment,
  listComments,
  getCommentById,
} from '@/modules/comments/services';

// Result types
export type {
  CreateCommentResult,
  UpdateCommentResult,
  DeleteCommentResult,
  GetCommentByIdResult,
  ListCommentsResult,
} from '@/modules/comments/types';

export type {
  MediaCommentTab,
  MediaCommentPersonalNotes,
  MediaCommentTabsProps,
} from '@/modules/comments/types/mediaCommentTabs';

// Constants
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
export const DEFAULT_COMMENT_LIMIT = 20;
