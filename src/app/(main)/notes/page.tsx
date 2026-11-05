import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IconNotes, IconSearch, IconSearchOff } from '@tabler/icons-react';
import { auth } from '@/infra/auth/auth';
import { NoteTimestamp } from '@/modules/notes/components/NoteTimestamp';
import { listNotesForUser } from '@/modules/notes/services/listNotesForUser';
import { NOTE_PAGE_SIZE } from '@/modules/notes/constants';
import { BackButton } from '@/shared/ui/BackButton';
import { EmptyState } from '@/shared/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your notes',
  description: 'Every private note you wrote, newest first.',
};

type NotesIndexPageProps = {
  searchParams: Promise<{ q?: string }>;
};

/**
 * The one place that lists notes across titles. Notes stay private and
 * many-per-title, so this reads them all and resolves each title from the
 * viewer's own library — nothing here is a cross-account read.
 */
const NotesIndexPage = async ({ searchParams }: NotesIndexPageProps) => {
  const { q } = await searchParams;
  const search = q?.trim() ?? '';

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const notes = await listNotesForUser({ userId, search });
  const hasQuery = search.length > 0;

  return (
    <article className="animate-fade-in mx-auto w-full max-w-3xl space-y-8 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton href="/" label="Back to dashboard" />
        <span className="apple-badge border border-violet-500/25 bg-violet-500/10 text-[11px] text-violet-300">
          {notes.length}
          {notes.length === NOTE_PAGE_SIZE ? '+' : ''} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
          <IconNotes size={22} className="text-violet-400" aria-hidden />
          Your notes
        </h1>
        <p className="text-sm text-zinc-400">
          Private to you — ratings live on each title, and notes are never shared or shown to
          anyone else.
        </p>
      </header>

      <form action="/notes" method="GET" role="search" className="relative flex items-center">
        <input
          type="search"
          name="q"
          defaultValue={search}
          aria-label="Search your notes"
          placeholder="Search your notes"
          className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-3 pl-11 text-sm font-medium text-white placeholder-zinc-500 shadow-lg transition-all hover:border-white/20 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 focus:outline-none"
        />
        <IconSearch aria-hidden className="absolute left-4 text-zinc-400" size={16} />
        <button
          type="submit"
          className="apple-pill-btn absolute right-1.5 cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:bg-violet-400"
        >
          Search
        </button>
      </form>

      {notes.length === 0 ? (
        hasQuery ? (
          <EmptyState
            icon={IconSearchOff}
            title={`No notes match “${search}”`}
            description="Try a shorter phrase, or clear the search to see every note."
            action={
              <Link
                href="/notes"
                className="apple-pill-btn mt-1 cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12"
              >
                Clear search
              </Link>
            }
            className="mx-auto max-w-xl"
          />
        ) : (
          <EmptyState
            icon={IconNotes}
            title="No notes yet"
            description="Open a film or episode, go to Personal Notes, and write the first one. Every note you write shows up here."
            action={
              <Link
                href="/library"
                className="apple-pill-btn mt-1 cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12"
              >
                Browse your library
              </Link>
            }
            className="mx-auto max-w-xl"
          />
        )
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="glass-card space-y-2 rounded-2xl border border-white/8 p-4 shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  {note.mediaHref ? (
                    <Link
                      href={note.mediaHref}
                      className="cursor-pointer text-sm font-bold text-white transition-colors hover:text-violet-300"
                    >
                      {note.mediaTitle}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-zinc-300">
                      {note.mediaTitle ?? 'Note'}
                    </span>
                  )}
                  {note.mediaSubtitle && (
                    <p className="text-[11px] font-semibold text-violet-300">
                      {note.mediaSubtitle}
                    </p>
                  )}
                </div>
                <NoteTimestamp value={note.createdAt} />
              </div>

              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-200">
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {notes.length === NOTE_PAGE_SIZE && (
        <p className="text-center text-[11px] text-zinc-500">
          Showing the {NOTE_PAGE_SIZE} most recent notes.
        </p>
      )}
    </article>
  );
};

export default NotesIndexPage;
