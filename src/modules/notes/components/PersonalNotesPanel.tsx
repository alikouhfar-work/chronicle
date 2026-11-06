'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  IconDeviceTv,
  IconLoader2,
  IconLock,
  IconMessage,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { createNote } from '@/modules/notes/actions/createNote';
import { deleteNote } from '@/modules/notes/actions/deleteNote';
import { updateNote } from '@/modules/notes/actions/updateNote';
import { NoteComposer } from '@/modules/notes/components/NoteComposer';
import { RatingControl } from '@/modules/notes/components/RatingControl';
import { toNoteView } from '@/modules/notes/lib/toNoteView';
import type { NoteView } from '@/modules/notes/types';
import type { PersonalNotesPanelProps } from '@/modules/notes/types/personalNotesPanel';
import { toastError } from '@/shared/lib/toast';

const STATUS_LABELS: Record<string, string> = {
  PLAN_TO_WATCH: 'Plan to watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

const relativeTime = (value: Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Personal tab: a rating that stands on its own, plus any number of private
 * notes the viewer can add, edit, and delete.
 */
export const PersonalNotesPanel = ({
  mediaType,
  tmdbId,
  viewer,
  signInHref = '/login',
  rating,
  ratingTargetId,
  trackingStatus,
  rewatchCount,
  initialNotes,
}: PersonalNotesPanelProps) => {
  const [notes, setNotes] = useState<NoteView[]>(initialNotes ?? []);
  const [creating, setCreating] = useState(false);
  const [composerOpen, setComposerOpen] = useState((initialNotes?.length ?? 0) === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!viewer) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-card border border-line p-8 py-10 text-center">
        <IconLock size={20} className="text-ink-subtle" />
        <p className="text-sm text-ink-muted">Sign in to see your personal notes.</p>
        <Link
          href={signInHref}
          className="apple-pill-btn bg-accent px-4 py-2 text-xs font-bold text-ink shadow-card shadow-accent/25 hover:bg-accent-strong"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleCreate = async (content: string) => {
    setError(null);
    setCreating(true);

    const result = await createNote({ mediaType, tmdbId, content });
    setCreating(false);

    if (!result.success || !result.note) {
      setError(result.error ?? 'Could not save your note.');
      toastError(result.error, 'Couldn’t save note.');
      return;
    }

    setNotes((previous) => [result.note!, ...previous]);
    setComposerOpen(false);
  };

  const handleUpdate = async (noteId: string, content: string) => {
    setError(null);
    setSavingEdit(true);

    const result = await updateNote(noteId, { content });
    setSavingEdit(false);

    if (!result.success || !result.note) {
      setError(result.error ?? 'Could not update your note.');
      toastError(result.error, 'Couldn’t update note.');
      return;
    }

    setNotes((previous) =>
      previous.map((note) => (note.id === noteId ? toNoteView({ ...result.note! }) : note)),
    );
    setEditingId(null);
  };

  const handleDelete = async (noteId: string) => {
    setError(null);
    setDeletingId(noteId);

    const result = await deleteNote(noteId);
    setDeletingId(null);
    setConfirmingId(null);

    if (!result.success) {
      setError(result.error ?? 'Could not delete your note.');
      toastError(result.error, 'Couldn’t delete note.');
      return;
    }

    setNotes((previous) => previous.filter((note) => note.id !== noteId));
  };

  const statusLabel = trackingStatus ? (STATUS_LABELS[trackingStatus] ?? trackingStatus) : null;

  return (
    <div className="glass-card space-y-5 rounded-card border border-line p-6">
      <div className="space-y-4 border-b border-line pb-4">
        <h4 className="flex items-center gap-2 text-xs font-bold tracking-tight text-accent-ink uppercase">
          <IconDeviceTv size={14} className="text-accent-ink" />
          <span>Your Rating &amp; Notes</span>
        </h4>

        {ratingTargetId && (
          <RatingControl
            mediaType={mediaType === 'movie' ? 'movie' : 'episode'}
            targetId={ratingTargetId}
            value={rating}
            label="Your rating"
          />
        )}

        {mediaType === 'show' && (
          <dl className="grid grid-cols-2 gap-2.5">
            <div className="rounded-card border border-line bg-surface-soft p-3">
              <dt className="text-micro font-semibold tracking-wider text-ink-muted uppercase">
                Tracking
              </dt>
              <dd className="mt-1 text-xs font-bold text-ink-secondary">
                {statusLabel ?? 'Not tracked'}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-surface-soft p-3">
              <dt className="text-micro font-semibold tracking-wider text-ink-muted uppercase">
                Rewatches
              </dt>
              <dd className="mt-1 text-xs font-bold text-ink-secondary">{rewatchCount ?? 0}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h5 className="flex items-center gap-2 text-micro font-bold tracking-wider text-ink-muted uppercase">
            <IconMessage size={13} className="text-accent-ink" />
            <span>Private notes</span>
            <span className="text-ink-subtle">({notes.length})</span>
          </h5>
          {!composerOpen && (
            <button
              type="button"
              onClick={() => {
                setComposerOpen(true);
                setEditingId(null);
              }}
              className="apple-pill-btn cursor-pointer bg-accent px-3.5 py-2 text-xs font-bold text-ink shadow-card shadow-accent/25 hover:bg-accent-strong"
            >
              <IconPlus size={13} />
              Add note
            </button>
          )}
        </div>

        {composerOpen && (
          <NoteComposer
            label="Save note"
            submitting={creating}
            onSubmit={(content) => void handleCreate(content)}
            onCancel={notes.length > 0 ? () => setComposerOpen(false) : undefined}
          />
        )}

        {error && (
          <p
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {error}
          </p>
        )}

        {notes.length === 0 ? (
          <p className="py-3 text-center text-xs text-ink-muted">
            No personal notes yet. Notes are private and you can keep as many as you like.
          </p>
        ) : (
          <ul className="space-y-2.5" aria-live="polite">
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const isDeleting = deletingId === note.id;
              const isConfirming = confirmingId === note.id;

              return (
                <li
                  key={note.id}
                  className={`rounded-card border border-line bg-white/[0.02] p-3.5 ${
                    note.pending ? 'opacity-70' : ''
                  }`}
                >
                  {isEditing ? (
                    <NoteComposer
                      label="Save changes"
                      initialValue={note.content}
                      submitting={savingEdit}
                      onSubmit={(content) => void handleUpdate(note.id, content)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-ink-secondary">
                          {note.content}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(note.id);
                              setConfirmingId(null);
                            }}
                            aria-label="Edit note"
                            title="Edit note"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-xs bg-surface-soft text-ink-secondary hover:bg-surface-soft-hover"
                          >
                            <IconPencil size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              isConfirming ? void handleDelete(note.id) : setConfirmingId(note.id)
                            }
                            disabled={isDeleting}
                            aria-label={isConfirming ? 'Confirm delete note' : 'Delete note'}
                            title={isConfirming ? 'Confirm delete' : 'Delete note'}
                            className={`flex size-7 cursor-pointer items-center justify-center rounded-xs text-ink-secondary disabled:cursor-wait disabled:opacity-60 ${
                              isConfirming
                                ? 'bg-danger/80 text-canvas hover:bg-danger'
                                : 'bg-surface-soft hover:bg-danger-soft hover:text-danger'
                            }`}
                          >
                            {isDeleting ? (
                              <IconLoader2
                                size={12}
                                className="animate-spin motion-reduce:animate-none"
                              />
                            ) : isConfirming ? (
                              <IconTrash size={12} />
                            ) : (
                              <IconX size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 text-micro text-ink-muted">
                        {relativeTime(note.createdAt)}
                        {note.updatedAt && note.updatedAt > note.createdAt ? ' · edited' : ''}
                      </p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PersonalNotesPanel;
