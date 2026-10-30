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
} from '@/modules/comments/services';

// Constants
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 4;
export const DEFAULT_COMMENT_LIMIT = 20;