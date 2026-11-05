'use client';

import { formatDistanceToNow } from 'date-fns';

type NoteTimestampProps = {
  value: Date;
};

/**
 * Relative time is computed in the browser so the server's timezone never leaks
 * into a user-visible date (the same reason WP-10 moved the rest of the
 * formatting client-side).
 */
export const NoteTimestamp = ({ value }: NoteTimestampProps) => {
  const date = value instanceof Date ? value : new Date(value);
  const text = Number.isNaN(date.getTime())
    ? ''
    : formatDistanceToNow(date, { addSuffix: true });

  return (
    <time dateTime={date.toISOString()} className="shrink-0 text-[11px] text-zinc-500">
      {text}
    </time>
  );
};
