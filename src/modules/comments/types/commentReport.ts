/** Props for the flag and the inline form that reports a review (WP-19). */
export type CommentReportButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
};

export type CommentReportFormProps = {
  commentId: string;
  onClose: () => void;
  onReported: () => void;
};
