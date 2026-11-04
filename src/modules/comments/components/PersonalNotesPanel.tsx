'use client';

import Link from 'next/link';
import { IconDeviceTv, IconLock, IconMessage, IconStar } from '@tabler/icons-react';
import type { PersonalNotesPanelProps } from '@/modules/comments/types/mediaCommentTabs';
import type { NotesEmptyStateProps } from '@/modules/comments/types/personalNotesPanel';

const STATUS_LABELS: Record<string, string> = {
  PLAN_TO_WATCH: 'Plan to watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

const EmptyState = ({ children }: NotesEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center space-y-2.5 py-8 text-center">
    {children}
  </div>
);

/**
 * Personal Notes tab content.
 *
 * - Movies render the MovieTracking rating + notes.
 * - Episodes render the EpisodeTracking rating + notes.
 * - Shows render only the show-level tracking summary with an explicit empty
 *   state. No show notes table is invented here.
 */
export const PersonalNotesPanel = ({
  mediaType,
  personalNotes,
  viewer,
  signInHref = '/login',
  editor,
}: PersonalNotesPanelProps) => {
  if (!viewer) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 p-8 py-10 text-center">
        <IconLock size={20} className="text-zinc-500" />
        <p className="text-sm text-zinc-400">Sign in to see your personal notes.</p>
        <Link
          href={signInHref}
          className="apple-pill-btn bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (mediaType === 'show') {
    const status = personalNotes?.trackingStatus ?? null;
    const rewatchCount = personalNotes?.rewatchCount ?? 0;
    const statusLabel = status ? (STATUS_LABELS[status] ?? status) : null;

    return (
      <div className="glass-card space-y-4 rounded-3xl border border-white/10 p-6">
        <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
          <h4 className="flex items-center gap-2 text-xs font-bold tracking-tight text-violet-400 uppercase">
            <IconDeviceTv size={14} className="text-violet-400" />
            <span>Show Summary</span>
          </h4>
          {statusLabel && (
            <span className="apple-badge border border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-300">
              {statusLabel}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/6 bg-white/3 p-3">
            <dt className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              Tracking
            </dt>
            <dd className="mt-1 text-xs font-bold text-zinc-200">{statusLabel ?? 'Not tracked'}</dd>
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/3 p-3">
            <dt className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              Rewatches
            </dt>
            <dd className="mt-1 text-xs font-bold text-zinc-200">{rewatchCount}</dd>
          </div>
        </dl>

        <EmptyState>
          <IconMessage size={20} className="text-zinc-500" />
          <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
            Show-level notes aren&apos;t available yet. Open an episode to log its personal rating
            and notes.
          </p>
        </EmptyState>
      </div>
    );
  }

  const rating = personalNotes?.rating ?? null;
  const notes = personalNotes?.notes?.trim() ? personalNotes.notes.trim() : null;
  const hasNotes = Boolean(rating || notes);

  return (
    <div className="glass-card space-y-4 rounded-3xl border border-white/10 p-6">
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <h4 className="flex items-center gap-2 text-xs font-bold tracking-tight text-violet-400 uppercase">
          <IconStar size={14} className="text-violet-400" />
          <span>Your Review &amp; Thoughts</span>
        </h4>
        {rating ? (
          <span className="apple-badge border border-amber-400/20 bg-amber-400/10 text-[10px] text-amber-300">
            {rating} / 5
          </span>
        ) : null}
      </div>

      {hasNotes ? (
        <div className="space-y-3">
          {rating ? (
            <div
              className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 p-1.5"
              aria-label={`Rated ${rating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <IconStar
                  key={star}
                  aria-hidden
                  className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}
                  size={14}
                />
              ))}
            </div>
          ) : null}
          {notes ? (
            <p className="rounded-r-xl border-l-2 border-violet-400 bg-violet-500/[0.04] py-2 pl-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-200 italic">
              &#34;{notes}&#34;
            </p>
          ) : null}
          {editor ? <div className="pt-1">{editor}</div> : null}
        </div>
      ) : (
        <EmptyState>
          <IconStar size={20} className="text-zinc-500" />
          <p className="text-xs text-zinc-400">No personal notes yet.</p>
          <p className="max-w-xs text-[11px] leading-relaxed text-zinc-500">
            {mediaType === 'movie'
              ? 'Log a rating and notes from the movie log above.'
              : 'Add a rating and notes for this episode.'}
          </p>
          {editor ? <div className="pt-1">{editor}</div> : null}
        </EmptyState>
      )}
    </div>
  );
};

export default PersonalNotesPanel;
