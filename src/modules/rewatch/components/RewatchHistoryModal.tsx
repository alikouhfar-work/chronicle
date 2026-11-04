'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
  IconCalendarPlus,
  IconHistory,
  IconLoader2,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { loadRewatchHistory } from '@/modules/rewatch/actions/loadRewatchHistory';
import { removeRewatch } from '@/modules/rewatch/actions/removeRewatch';
import type {
  RewatchHistoryEntry,
  RewatchHistoryModalProps,
} from '@/modules/rewatch/types/rewatch';
import { toastError } from '@/shared/lib/toast';

const toDateTimeInputValue = (date: Date = new Date()): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const formatRewatchedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'MMM d, yyyy • h:mm a');
};

export const RewatchHistoryModal = ({
  mediaType,
  mediaId,
  title,
  initialCount,
  onCountChange,
  onClose,
}: RewatchHistoryModalProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [history, setHistory] = useState<RewatchHistoryEntry[] | null>(null);
  const [count, setCount] = useState(initialCount);
  const [customDate, setCustomDate] = useState(() => toDateTimeInputValue());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, startAdd] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (dialogError) {
        toastError(dialogError, 'Couldn’t open the watch history dialog.');
        onClose();
      }
    }
  }, [onClose]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      const result = await loadRewatchHistory(mediaType, mediaId);
      if (!active) return;

      if (!result.success) {
        setError(result.error);
        setHistory([]);
        setIsLoading(false);
        return;
      }

      setHistory(result.history);
      setCount(result.rewatchCount);
      onCountChange?.(result.rewatchCount);
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [mediaId, mediaType, onCountChange]);

  const updateCount = (nextCount: number) => {
    setCount(nextCount);
    onCountChange?.(nextCount);
  };

  const handleAdd = () => {
    const selectedDate = customDate ? new Date(customDate) : new Date();
    if (Number.isNaN(selectedDate.getTime())) {
      setError('Choose a valid date and time.');
      return;
    }

    setError(null);
    startAdd(async () => {
      const result = await addRewatch(mediaType, mediaId, selectedDate.toISOString());
      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      setHistory((current) =>
        [...(current ?? []), { id: result.logId, rewatchedAt: result.rewatchedAt }].sort(
          (a, b) => a.rewatchedAt.localeCompare(b.rewatchedAt),
        ),
      );
      updateCount(result.rewatchCount);
      setCustomDate(toDateTimeInputValue());
      router.refresh();
    });
  };

  const handleDelete = (logId: string) => {
    setError(null);
    setDeletingId(logId);
    startDelete(async () => {
      const result = await removeRewatch(logId);
      setDeletingId(null);

      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      setHistory((current) => (current ?? []).filter((entry) => entry.id !== logId));
      updateCount(result.rewatchCount);
      router.refresh();
    });
  };

  const isPending = isAdding || isDeleting;
  const reversedHistory = [...(history ?? [])].reverse();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        if (isPending) event.preventDefault();
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
          if (event.target === event.currentTarget && !isPending) dialogRef.current?.close();
        }}
      >
        <div className="glass-card flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-hidden rounded-3xl border-white/15 bg-zinc-950/90 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <IconHistory size={18} className="text-violet-400" />
                <span>Watch History</span>
              </h3>
              <p className="mt-0.5 text-xs font-medium text-zinc-400">
                {title} • {count} {count === 1 ? 'watch' : 'watches'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isPending}
              className="apple-pill-btn cursor-pointer bg-white/6 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/12 disabled:opacity-60"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-zinc-400">
                <IconLoader2 size={16} className="animate-spin text-violet-400" />
                <span>Loading watches…</span>
              </div>
            ) : reversedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <IconRotateClockwise size={22} className="text-violet-400/70" />
                <p className="text-xs text-zinc-400">No watches logged yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/6">
                {reversedHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-violet-500/12 text-violet-400">
                        <IconRotateClockwise size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">
                          {formatRewatchedAt(entry.rewatchedAt)}
                        </p>
                        <p className="text-[10px] text-zinc-400">Watch logged</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={isPending}
                      aria-label="Delete watch entry"
                      title="Delete watch entry"
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting && deletingId === entry.id ? (
                        <IconLoader2 size={14} className="animate-spin" />
                      ) : (
                        <IconTrash size={14} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2.5 border-t border-white/8 pt-4">
            <label
              htmlFor="watch-date"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
            >
              <IconCalendarPlus size={14} className="text-violet-400" />
              <span>Add a watch with a custom date</span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="watch-date"
                type="datetime-local"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
                disabled={isPending}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-violet-400/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || isLoading}
                className="apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAdding ? 'Adding…' : 'Add Watch'}
              </button>
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
};
