import Link from 'next/link';
import {
  IconAlertCircle,
  IconBookmark,
  IconCompass,
  IconLayoutDashboard,
  IconQuestionMark,
} from '@tabler/icons-react';

export default function NotFound() {
  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/8 p-8 text-center shadow-2xl sm:p-12">
      {/* Ambient atmospheric lighting */}
      <div className="pointer-events-none absolute -top-12 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute right-10 -bottom-16 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-4 h-40 w-40 rounded-full bg-rose-500/10 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-xl space-y-6">
        {/* Animated Glowing Icon Glyph */}
        <div className="relative inline-flex items-center justify-center">
          <div className="group flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-gradient-to-br from-violet-600/30 via-zinc-900/80 to-indigo-900/30 shadow-2xl ring-1 shadow-violet-950/60 ring-white/10 backdrop-blur-xl sm:h-28 sm:w-28">
            <IconQuestionMark className="h-12 w-12 text-violet-300 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14" />
          </div>
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-xl" />
        </div>

        {/* Heading & Reason */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <IconAlertCircle size={13} className="text-violet-400" />
            <span>Requested Media Unavailable</span>
          </div>

          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
            Media Details Not Found
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed font-normal text-zinc-400 sm:text-base">
            We couldn&#39;t locate this TV series or movie. It may have been removed from your
            library, renamed, or the requested identifier does not match any current records.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            id="not-found-library-btn"
            href="/library"
            prefetch
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 active:scale-95 sm:text-sm"
          >
            <IconBookmark size={15} />
            <span>Return to Library</span>
          </Link>

          <Link
            id="not-found-search-btn"
            href="/search"
            prefetch
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 border border-white/10 bg-white/8 px-5 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/[0.15] active:scale-95 sm:text-sm"
          >
            <IconCompass size={15} className="text-violet-400" />
            <span>Discover Catalog</span>
          </Link>

          <Link
            id="not-found-dashboard-btn"
            href="/"
            prefetch
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.10] active:scale-95 sm:text-sm"
          >
            <IconLayoutDashboard size={15} className="text-zinc-400" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
