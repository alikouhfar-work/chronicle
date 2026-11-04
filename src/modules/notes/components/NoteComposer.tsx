'use client';

import { useState } from 'react';
import { IconLoader2 } from '@tabler/icons-react';
import { NOTE_MAX_LENGTH } from '@/modules/notes/constants';
import type { NoteComposerProps } from '@/modules/notes/types/personalNotesPanel';

/** Shared create/edit form for private notes. */
export const NoteComposer = ({
  initialValue = '',
  submitting,
  label,
  onSubmit,
  onCancel,
}: NoteComposerProps) => {
  const [value, setValue] = useState(initialValue);
  const canSave = value.trim().length > 0 && !submitting;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        onSubmit(value.trim());
        if (!onCancel) setValue('');
      }}
      className="space-y-2"
    >
      <label className="sr-only" htmlFor={`note-composer-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        {label}
      </label>
      <textarea
        id={`note-composer-${label.replace(/\s+/g, '-').toLowerCase()}`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        rows={3}
        disabled={submitting}
        placeholder="Write a private note — only you can read it."
        className="w-full resize-y rounded-2xl border border-white/10 bg-zinc-950/60 px-3.5 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/25 focus:outline-none disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-500">
          {value.trim().length}/{NOTE_MAX_LENGTH}
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!canSave}
            className="apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <IconLoader2 size={13} className="animate-spin motion-reduce:animate-none" />
            ) : null}
            {label}
          </button>
        </div>
      </div>
    </form>
  );
};
