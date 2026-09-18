'use client';

import { FC, useActionState, useEffect, useRef, useState } from 'react';
import { IconStar } from '@tabler/icons-react';
import { LibraryDetailsLogState } from '@/features/library/types/libraryDetailsLog';
import { LibraryDetailsLogModalProps } from '@/features/library/types/libraryDetailsLogModal';

const initialState: LibraryDetailsLogState = { success: false };

export const LibraryDetailsLogModal: FC<LibraryDetailsLogModalProps> = ({
  icon,
  title,
  subtitle,
  hiddenFields,
  initialRating,
  initialNotes,
  action,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (e) {
        console.error('[modal] showModal failed:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.success) dialogRef.current?.close();
  }, [state.success]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        if (isPending) e.preventDefault();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        margin: 0,
        padding: 0,
        border: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
        background: 'transparent',
        color: 'inherit',
        overflow: 'hidden',
      }}
      className="backdrop:bg-black/20 backdrop:backdrop-blur-md"
    >
      <div
        className="flex h-full w-full items-center justify-center p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isPending) dialogRef.current?.close();
        }}
      >
        <form
          action={formAction}
          className="glass-card w-full max-w-md space-y-5 rounded-3xl border-white/15 bg-zinc-950/90 p-6 shadow-2xl"
        >
          {Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input type="hidden" name="rating" value={rating} />

          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              {icon}
              <span>{title}</span>
            </h3>
            {subtitle && <p className="mt-0.5 text-xs font-medium text-zinc-400">{subtitle}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300 ml-1">Your Rating</label>
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/4 p-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating((prev) => (prev === star ? 0 : star))}
                  disabled={isPending}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className="cursor-pointer p-1 transition-all duration-150 hover:scale-125 active:scale-95 disabled:opacity-60"
                >
                  <IconStar
                    className={
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700 hover:text-zinc-500'
                    }
                    size={24}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="log-notes" className="text-xs ml-1 font-semibold text-zinc-300">
              Thoughts &amp; Critique
            </label>
            <textarea
              id="log-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="Log direction, acting, themes, and cinematography thoughts..."
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/4 p-3 text-xs leading-relaxed text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-400/20 focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isPending}
              className="apple-pill-btn cursor-pointer bg-white/6 px-4 py-2 text-xs text-zinc-300 hover:bg-white/12 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="apple-pill-btn cursor-pointer bg-violet-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400 disabled:opacity-60"
            >
              {isPending ? 'Saving…' : 'Save Review'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
