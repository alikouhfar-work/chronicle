'use client';

import { IconFlag } from '@tabler/icons-react';
import type { CommentReportButtonProps } from '@/modules/comments/types/commentReport';

/** The flag that opens the report form, next to a review that is not yours. */
export const CommentReportButton = ({ onOpen, disabled }: CommentReportButtonProps) => (
  <button
    type="button"
    onClick={onOpen}
    disabled={disabled}
    aria-label="Report this review"
    title="Report review"
    className="flex size-7 cursor-pointer items-center justify-center rounded-xs bg-surface-soft text-ink-muted transition-colors hover:bg-warning-soft hover:text-rating disabled:cursor-not-allowed disabled:opacity-50"
  >
    <IconFlag size={12} />
  </button>
);
