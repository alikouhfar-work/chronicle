'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconCircleX, IconDeviceTv, IconLoader2, IconRotateClockwise } from '@tabler/icons-react';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { undoUnwatch } from '@/modules/rewatch/actions/undoUnwatch';
import { unwatchMedia } from '@/modules/rewatch/actions/unwatchMedia';
import type {
  WatchActionModalProps,
  WatchActionPending,
} from '@/modules/rewatch/types/watchActionModal';
import { toastError, toastSuccess } from '@/shared/lib/toast';

const HEADINGS: Record<WatchActionModalProps['mediaType'], string> = {
  episode: 'Episode Options',
  season: 'Season Options',
  show: 'Show Options',
  movie: 'Movie Options',
};

const NOUNS: Record<WatchActionModalProps['mediaType'], string> = {
  episode: 'episode',
  season: 'season',
  show: 'show',
  movie: 'movie',
};

/**
 * Watched-media confirmation dialog shared by movies, shows, seasons, and
 * episodes: once anything has been watched at least once, the watch control
 * asks whether this is another watch or an unwatch instead of silently
 * adding one.
 */
export const WatchActionModal = ({
  mediaType,
  mediaId,
  title,
  subtitle,
  watchCount,
  onRewatch,
  onUnwatch,
  onClose,
}: WatchActionModalProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // One idempotency key per dialog session: retrying inside the same dialog
  // (or a retried request) cannot log the same watch twice.
  const requestId = useRef<string>(crypto.randomUUID());
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<WatchActionPending>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (dialogError) {
        toastError(dialogError, 'Couldn’t open the watch options.');
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
      const result = await addRewatch(mediaType, mediaId, undefined, requestId.current);
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

  /**
   * Undo runs from a toast that outlives the dialog, so it uses the parent's
   * `onRewatch` callback (which restores the optimistic watched state) rather
   * than any local state here.
   */
  const handleUndo = async (undoToken: string) => {
    const restored = await undoUnwatch(undoToken);

    if (!restored.success) {
      toastError(restored.error);
      return;
    }

    onRewatch(restored.rewatchCount);
    router.refresh();
    toastSuccess('The watch history is back as it was.', 'Restored');
  };

  const handleUnwatch = () => {
    if (isBusy) return;

    setError(null);
    setPendingAction('unwatch');

    startTransition(async () => {
      const result = await unwatchMedia(mediaType, mediaId);
      setPendingAction(null);

      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      const removed = result.removedLogs;
      const undoToken = result.undoToken;
      toastSuccess(
        removed === 1
          ? 'Watch removed.'
          : `${removed} logged watches removed.`,
        'Unwatched',
        undoToken ? { label: 'Undo', onClick: () => void handleUndo(undoToken) } : undefined,
      );
      onUnwatch(result.rewatchCount);
      router.refresh();
      dialogRef.current?.close();
    });
  };

  const noun = NOUNS[mediaType];

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
          aria-labelledby="watch-options-title"
          className="glass-card animate-fade-in w-full max-w-sm space-y-5 rounded-card border-line bg-surface-sunken/90 p-6 shadow-2xl"
        >
          <div className="space-y-1">
            <h3
              id="watch-options-title"
              className="flex items-center gap-2 text-base font-bold text-ink"
            >
              <IconDeviceTv size={18} className="text-accent-ink" />
              <span>{HEADINGS[mediaType]}</span>
            </h3>
            <p className="text-xs font-medium text-ink-muted">{title}</p>
            {subtitle && <p className="text-micro text-ink-muted">{subtitle}</p>}
            <p className="text-micro text-ink-muted">
              {watchCount} {watchCount === 1 ? 'watch' : 'watches'} logged
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRewatch}
              disabled={isBusy}
              aria-busy={pendingAction === 'rewatch'}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-card border border-accent-line bg-accent-bright/15 px-4 py-3 text-left transition-colors hover:bg-accent-bright/25 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-accent-bright/20 text-accent-ink">
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
                <span className="block text-xs font-bold text-accent-tint">
                  {pendingAction === 'rewatch' ? 'Logging rewatch…' : 'Rewatch'}
                </span>
                <span className="block text-micro text-ink-muted">
                  Log another watch of this {noun} with the current timestamp.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleUnwatch}
              disabled={isBusy}
              aria-busy={pendingAction === 'unwatch'}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-card border border-danger/30 bg-danger-soft px-4 py-3 text-left transition-colors hover:bg-danger-soft disabled:cursor-wait disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-danger-soft text-danger">
                {pendingAction === 'unwatch' ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCircleX size={16} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-danger">
                  {pendingAction === 'unwatch' ? 'Clearing watches…' : 'Unwatch'}
                </span>
                <span className="block text-micro text-ink-muted">
                  Clear the watched status and watch history of this {noun}. Ratings are kept.
                </span>
              </span>
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xs border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isBusy}
              className="apple-pill-btn cursor-pointer border border-line bg-surface-soft px-4 py-2 text-xs font-semibold text-ink-secondary hover:bg-surface-soft-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default WatchActionModal;
