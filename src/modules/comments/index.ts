export { CommentContent } from '@/modules/comments/components/CommentContent';
export { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
export { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';
export { PersonalNotesPanel } from '@/modules/comments/components/PersonalNotesPanel';
export { PublicReviewsPanel } from '@/modules/comments/components/PublicReviewsPanel';
export { getCommentViewer } from '@/modules/comments/services/getCommentViewer';
export { getCommentById } from '@/modules/comments/services/getCommentById';
export { listComments } from '@/modules/comments/services/listComments';

export {
  createComment,
  updateComment,
  deleteComment,
} from '@/modules/comments/actions';

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

// Constants (runtime values live outside the types barrel)
export {
  COMMENT_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
  MAX_ATTACHMENTS,
  DEFAULT_COMMENT_LIMIT,
  COMMENT_SORT,
} from '@/modules/comments/constants';
