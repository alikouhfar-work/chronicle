'use client';

import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { deleteShowFromLibrary } from '@/modules/show/actions/deleteShowFromLibrary';
import { LibraryMediaDeleteButtonProps } from '@/modules/library/types/libraryMediaDeleteButton';
import { deleteMovieFromLibrary } from '@/modules/movie/actions/deleteMovieFromLibrary';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const LibraryMediaDeleteButton = ({
  mediaId,
  mediaType,
}: LibraryMediaDeleteButtonProps) => {
  const isSeries = mediaType === 'tv';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { execute: removeMedia, isPending } = useServerAction(
    isSeries ? deleteShowFromLibrary : deleteMovieFromLibrary,
    {
      successMessage: isSeries ? 'Series deleted from library' : 'Movie deleted from library',
      errorMessage: 'Couldn’t delete this title. Please try again.',
    },
  );

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(false);
    removeMedia(mediaId);
  };

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

      {confirmOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={`Remove this ${isSeries ? 'series' : 'movie'} from your library?`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirmOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="glass-card relative w-full max-w-xs space-y-4 rounded-2xl border border-white/10 p-5 shadow-2xl"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Remove from library?</h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                This will permanently remove this {isSeries ? 'series' : 'movie'} and all of its
                tracking history.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmOpen(false);
                }}
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
        </div>
      )}
    </>
  );
};
