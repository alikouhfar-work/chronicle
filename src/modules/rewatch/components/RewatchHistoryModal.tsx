'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
  IconCalendarPlus,
  IconCheck,
  IconHistory,
  IconLoader2,
  IconPencil,
  IconRotateClockwise,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { loadRewatchHistory } from '@/modules/rewatch/actions/loadRewatchHistory';
import { removeRewatch } from '@/modules/rewatch/actions/removeRewatch';
import { undoUnwatch } from '@/modules/rewatch/actions/undoUnwatch';
import { updateRewatchLog } from '@/modules/rewatch/actions/updateRewatchLog';
import type {
  RewatchHistoryEntry,
  RewatchHistoryModalProps,
} from '@/modules/rewatch/types/rewatch';
import { toastError, toastSuccess } from '@/shared/lib/toast';

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
  // Stable per attempt so a retried add cannot double-log the watch.
  const addRequestId = useRef<string>(crypto.randomUUID());
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
      const result = await addRewatch(
        mediaType,
        mediaId,
        selectedDate.toISOString(),
        addRequestId.current,
      );
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

  /**
   * The toast outlives the removal, so the restored rows are re-read rather than
   * patched back in — a batch removal brings back several entries at once.
   */
  const handleUndoRemoval = async (undoToken: string) => {
    const restored = await undoUnwatch(undoToken);

    if (!restored.success) {
      toastError(restored.error);
      return;
    }

    const reloaded = await loadRewatchHistory(mediaType, mediaId);
    if (reloaded.success) {
      setHistory(reloaded.history);
      updateCount(reloaded.rewatchCount);
    }

    router.refresh();
    toastSuccess('The watch history is back as it was.', 'Restored');
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

      const undoToken = result.undoToken;
      toastSuccess(
        result.removedLogs === 1
          ? 'Watch removed.'
          : `${result.removedLogs} logged watches removed.`,
        'Unwatched',
        undoToken ? { label: 'Undo', onClick: () => void handleUndoRemoval(undoToken) } : undefined,
      );
      router.refresh();
    });
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, startSaveEdit] = useTransition();

  const isPending = isAdding || isDeleting || isSavingEdit;

  const beginEdit = (entry: RewatchHistoryEntry) => {
    setError(null);
    setEditingId(entry.id);
    setEditValue(toDateTimeInputValue(new Date(entry.rewatchedAt)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (logId: string) => {
    const next = new Date(editValue);
    if (Number.isNaN(next.getTime())) {
      setError('Choose a valid date and time.');
      return;
    }

    setError(null);
    startSaveEdit(async () => {
      const result = await updateRewatchLog(logId, next.toISOString());
      if (!result.success) {
        setError(result.error);
        toastError(result.error);
        return;
      }

      setHistory((current) =>
        (current ?? [])
          .map((entry) =>
            entry.id === logId ? { ...entry, rewatchedAt: result.rewatchedAt } : entry,
          )
          .sort((a, b) => a.rewatchedAt.localeCompare(b.rewatchedAt)),
      );
      cancelEdit();
      toastSuccess('Watch date updated.', 'Saved');
      router.refresh();
    });
  };
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
        <div className="glass-card flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-hidden rounded-card border-line bg-surface-sunken/90 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                <IconHistory size={18} className="text-accent-ink" />
                <span>Watch History</span>
              </h3>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {title} • {count} {count === 1 ? 'watch' : 'watches'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isPending}
              className="apple-pill-btn cursor-pointer bg-surface-soft px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-soft-hover disabled:opacity-60"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-white/[0.02]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-ink-muted">
                <IconLoader2 size={16} className="animate-spin text-accent-ink" />
                <span>Loading watches…</span>
              </div>
            ) : reversedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <IconRotateClockwise size={22} className="text-accent-ink/70" />
                <p className="text-xs text-ink-muted">No watches logged yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {reversedHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-pill bg-accent-bright/12 text-accent-ink">
                        <IconRotateClockwise size={14} />
                      </span>
                      <div>
                        {editingId === entry.id ? (
                          <input
                            type="datetime-local"
                            value={editValue}
                            onChange={(event) => setEditValue(event.target.value)}
                            aria-label="Watch date and time"
                            className="rounded-xs border border-line bg-black/30 px-2 py-1 text-xs text-ink"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-ink-secondary">
                            {formatRewatchedAt(entry.rewatchedAt)}
                          </p>
                        )}
                        <p className="text-micro text-ink-muted">
                          {editingId === entry.id ? 'Edit the date' : 'Watch logged'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {editingId === entry.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(entry.id)}
                            disabled={isPending}
                            aria-label="Save watch date"
                            title="Save watch date"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-surface-soft text-ink-muted transition-colors hover:bg-accent-bright/20 hover:text-accent-tint disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSavingEdit ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              <IconCheck size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isPending}
                            aria-label="Cancel date edit"
                            title="Cancel date edit"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-surface-soft text-ink-muted transition-colors hover:bg-surface-soft-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IconX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => beginEdit(entry)}
                            disabled={isPending}
                            aria-label="Edit watch date"
                            title="Edit watch date"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-surface-soft text-ink-muted transition-colors hover:bg-surface-soft-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IconPencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            disabled={isPending}
                            aria-label="Delete watch entry"
                            title="Delete watch entry"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-surface-soft text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting && deletingId === entry.id ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              <IconTrash size={14} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2.5 border-t border-line pt-4">
            <label
              htmlFor="watch-date"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary"
            >
              <IconCalendarPlus size={14} className="text-accent-ink" />
              <span>Add a watch with a custom date</span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="watch-date"
                type="datetime-local"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
                disabled={isPending}
                className="min-w-0 flex-1 rounded-control border border-line bg-surface-soft px-3 py-2 text-xs text-ink focus-visible:ring-2 focus:ring-accent/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || isLoading}
                className="apple-pill-btn cursor-pointer bg-accent px-4 py-2 text-xs font-bold text-ink shadow-card shadow-accent/25 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAdding ? 'Adding…' : 'Add Watch'}
              </button>
            </div>
            {error && (
              <p className="rounded-xs border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
};
