'use client';

import { useState } from 'react';
import { IconLoader2, IconSend, IconX } from '@tabler/icons-react';
import { reportComment } from '@/modules/comments/actions/reportComment';
import {
  COMMENT_REPORT_NOTE_MAX_LENGTH,
  COMMENT_REPORT_REASONS,
  COMMENT_REPORT_REASON_LABELS,
  type CommentReportReason,
} from '@/modules/comments/constants';
import type { CommentReportFormProps } from '@/modules/comments/types/commentReport';
import { toastError, toastSuccess } from '@/shared/lib/toast';

/**
 * Inline report form: one reason plus an optional note. Reporting is per reader
 * per review, so a repeat submission is a no-op upstream — the UI also drops the
 * flag once the report lands.
 */
export const CommentReportForm = ({ commentId, onClose, onReported }: CommentReportFormProps) => {
  const [reason, setReason] = useState<CommentReportReason>('spam');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await reportComment({ commentId, reason, note: note.trim() || undefined });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Could not send the report. Please try again.');
      toastError(result.error);
      return;
    }

    toastSuccess(
      result.alreadyReported
        ? 'You already reported this review. Thanks again.'
        : 'Thanks — a moderator will look at this review.',
      'Report sent',
    );
    onReported();
    onClose();
  };

  return (
    <div className="mt-3 space-y-2 rounded-control border border-warning/30 bg-warning-soft p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-micro font-bold tracking-wider text-ink-secondary uppercase">
          Report this review
        </p>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Cancel report"
          className="flex size-6 cursor-pointer items-center justify-center rounded-xs text-ink-muted hover:bg-surface-soft-hover hover:text-ink disabled:cursor-not-allowed"
        >
          <IconX size={12} />
        </button>
      </div>

      <fieldset className="flex flex-wrap gap-x-3 gap-y-1.5" disabled={submitting}>
        <legend className="sr-only">Reason</legend>
        {COMMENT_REPORT_REASONS.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-1.5 text-micro text-ink-secondary"
          >
            <input
              type="radio"
              name={`report-reason-${commentId}`}
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
              className="accent-rating"
            />
            {COMMENT_REPORT_REASON_LABELS[value]}
          </label>
        ))}
      </fieldset>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, COMMENT_REPORT_NOTE_MAX_LENGTH))}
        disabled={submitting}
        aria-label="Report note (optional)"
        placeholder="Anything a moderator should know (optional)"
        rows={2}
        className="w-full resize-y rounded-xs border border-line-control bg-surface-sunken/60 px-3 py-2 text-xs text-ink-secondary placeholder:text-ink-subtle focus:border-warning/30 focus-visible:ring-2 focus:ring-warning/30 focus:outline-none"
      />

      {error && (
        <p role="alert" className="text-micro text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="apple-pill-btn cursor-pointer border border-line bg-surface-soft px-3 py-1.5 text-micro font-semibold text-ink-secondary hover:bg-surface-soft-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          aria-busy={submitting}
          className="apple-pill-btn flex cursor-pointer items-center gap-1.5 bg-warning-soft px-3 py-1.5 text-micro font-bold text-canvas hover:bg-warning disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? (
            <IconLoader2 size={12} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <IconSend size={12} />
          )}
          Send report
        </button>
      </div>
    </div>
  );
};
