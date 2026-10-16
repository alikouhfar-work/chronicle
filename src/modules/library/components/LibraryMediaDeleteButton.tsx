'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconTrash } from '@tabler/icons-react';
import { deleteShowFromLibrary } from '@/modules/show/actions/deleteShowFromLibrary';
import { LibraryMediaDeleteButtonProps } from '@/modules/library/types/libraryMediaDeleteButton';
import { deleteMovieFromLibrary } from '@/modules/movie/actions/deleteMovieFromLibrary';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

// Matches the fade-out animation duration below.
const CLOSE_ANIMATION_MS = 150;

export const LibraryMediaDeleteButton = ({
  mediaId,
  mediaType,
}: LibraryMediaDeleteButtonProps) => {
  const isSeries = mediaType === 'tv';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { execute: removeMedia, isPending } = useServerAction(
    isSeries ? deleteShowFromLibrary : deleteMovieFromLibrary,
    {
      successMessage: isSeries ? 'Series deleted from library' : 'Movie deleted from library',
      errorMessage: 'Couldn’t delete this title. Please try again.',
    },
  );

  const close = useCallback(() => {
    setLeaving(true);
    closeTimer.current = window.setTimeout(() => {
      setConfirmOpen(false);
      setLeaving(false);
    }, CLOSE_ANIMATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // Escape-to-close, background scroll lock, and initial focus while open.
  useEffect(() => {
    if (!confirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [confirmOpen, close]);

  const handleConfirm = () => {
    close();
    removeMedia(mediaId);
  };

  // The dialog portals to document.body (outside the card <Link>): ancestors
  // with transforms (card hover lift, fade-in animations) would otherwise
  // become the containing block for `fixed` positioning and trap/clip the
  // overlay, and buttons nested in an <a> are invalid HTML.
  return (
    <>
      <ActionButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        isPending={isPending}
        icon={<IconTrash size={12} strokeWidth={2.6} />}
        aria-label="Remove from library"
        aria-haspopup="dialog"
        title="Remove from library"
        className="cursor-pointer rounded-full border border-white/10 bg-black/60 p-2 text-zinc-400 backdrop-blur-md transition-all duration-200 hover:bg-rose-500/30 hover:text-rose-500 aria-busy:cursor-wait aria-busy:opacity-80"
      />

      {confirmOpen &&
        createPortal(
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={`Remove this ${isSeries ? 'series' : 'movie'} from your library?`}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
              leaving ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            // stopPropagation is required even though the dialog is portaled:
            // portal events bubble through the React tree (not the DOM), so
            // without it the click reaches the card <Link>'s onClick and
            // navigates to the details page.
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="glass-card relative w-full max-w-xs space-y-4 rounded-2xl border border-white/10 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Remove from library?</h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  This will permanently remove this {isSeries ? 'series' : 'movie'} and all of
                  its tracking history.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={close}
                  className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/12 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="apple-pill-btn cursor-pointer border border-rose-500/40 bg-rose-500/20 px-3.5 py-1.5 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
