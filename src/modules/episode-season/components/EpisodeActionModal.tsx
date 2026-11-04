'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconCircleX, IconLoader2, IconMovie, IconRotateClockwise } from '@tabler/icons-react';
import { unwatchEpisode } from '@/modules/episode-season/actions/unwatchEpisode';
import { EpisodeActionModalProps } from '@/modules/episode-season/types/episodeActionModal';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { toastError } from '@/shared/lib/toast';
import type { PendingAction } from '@/modules/episode-season/types/pendingAction';

export const EpisodeActionModal = ({
  episodeId,
  episodeName,
  episodeNumber,
  watchCount,
  onRewatch,
  onUnwatch,
  onClose,
}: EpisodeActionModalProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (dialogError) {
        toastError(dialogError, 'Couldn’t open the episode options.');
        onClose();
      }
    }
  }, [onClose]);

  const isBusy = isPending || pendingAction !== null;

  const handleRewatch = () => {
    if (isBusy) return;

    setError(null);
    setPendingAction('rewatch');

    startTransition(async () => {
      const result = await addRewatch('episode', episodeId);
      setPendingAction(null);

      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      onRewatch(result.rewatchCount);
      router.refresh();
      dialogRef.current?.close();
    });
  };

  const handleUnwatch = () => {
    if (isBusy) return;

    setError(null);
    setPendingAction('unwatch');

    startTransition(async () => {
      const result = await unwatchEpisode(episodeId);
      setPendingAction(null);

      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      onUnwatch(result.rewatchCount);
      router.refresh();
      dialogRef.current?.close();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        if (isBusy) event.preventDefault();
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
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isBusy) dialogRef.current?.close();
        }}
      >
        <div
          role="document"
          aria-labelledby="episode-options-title"
          className="glass-card animate-fade-in w-full max-w-sm space-y-5 rounded-3xl border-white/15 bg-zinc-950/90 p-6 shadow-2xl"
        >
          <div className="space-y-1">
            <h3
              id="episode-options-title"
              className="flex items-center gap-2 text-base font-bold text-white"
            >
              <IconMovie size={18} className="text-violet-400" />
              <span>Episode Options</span>
            </h3>
            <p className="text-xs font-medium text-zinc-400">
              Episode {episodeNumber} • {episodeName}
            </p>
            <p className="text-[11px] text-zinc-500">
              {watchCount} {watchCount === 1 ? 'watch' : 'watches'} logged
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRewatch}
              disabled={isBusy}
              aria-busy={pendingAction === 'rewatch'}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/15 px-4 py-3 text-left transition-colors hover:bg-violet-500/25 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                {pendingAction === 'rewatch' ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconRotateClockwise
                    size={16}
                    className="transition-transform duration-300 group-hover:-rotate-45"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-violet-200">
                  {pendingAction === 'rewatch' ? 'Logging rewatch…' : 'Rewatch'}
                </span>
                <span className="block text-[11px] text-zinc-400">
                  Log another watch with the current timestamp.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleUnwatch}
              disabled={isBusy}
              aria-busy={pendingAction === 'unwatch'}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-left transition-colors hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
                {pendingAction === 'unwatch' ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCircleX size={16} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-rose-300">
                  {pendingAction === 'unwatch' ? 'Clearing watches…' : 'Unwatch'}
                </span>
                <span className="block text-[11px] text-zinc-400">
                  Clear watched status and remove all watch history.
                </span>
              </span>
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isBusy}
              className="apple-pill-btn cursor-pointer bg-white/6 px-4 py-2 text-xs text-zinc-300 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
