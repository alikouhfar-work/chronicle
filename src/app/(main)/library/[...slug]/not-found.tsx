import Link from 'next/link';
import {
  IconAlertCircle,
  IconBookmark,
  IconCompass,
  IconLayoutDashboard,
  IconQuestionMark,
} from '@tabler/icons-react';

const NotFound = () => {
  return (
    <div className="glass-panel relative overflow-hidden rounded-card border border-line p-8 text-center shadow-2xl sm:p-12">
      {/* Ambient atmospheric lighting */}
      <div className="pointer-events-none absolute -top-12 left-1/2 h-96 w-96 -translate-x-1/2 rounded-pill bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute right-10 -bottom-16 h-80 w-80 rounded-pill bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-4 h-40 w-40 rounded-pill bg-danger-soft blur-2xl" />

      <div className="relative z-10 mx-auto max-w-xl space-y-6">
        {/* Animated Glowing Icon Glyph */}
        <div className="relative inline-flex items-center justify-center">
          <div className="group flex h-24 w-24 items-center justify-center rounded-card border border-line bg-gradient-to-br from-accent/30 via-surface-raised/80 to-secondary/30 shadow-2xl ring-1 shadow-accent/20 ring-white/10 backdrop-blur-xl sm:h-28 sm:w-28">
            <IconQuestionMark className="h-12 w-12 text-accent-ink transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14" />
          </div>
          <div className="absolute -inset-2 -z-10 rounded-card bg-gradient-to-r from-accent-bright/20 to-secondary/20 blur-xl" />
        </div>

        {/* Heading & Reason */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-pill border border-accent-line bg-accent-bright/10 px-3 py-1 text-xs font-semibold text-accent-ink">
            <IconAlertCircle size={13} className="text-accent-ink" />
            <span>Requested Media Unavailable</span>
          </div>

          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl">
            Media Details Not Found
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed font-normal text-ink-muted sm:text-base">
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
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 bg-accent px-5 py-2.5 text-xs font-bold text-ink shadow-lg shadow-accent/30 transition hover:bg-accent-bright active:scale-95 sm:text-sm"
          >
            <IconBookmark size={15} />
            <span>Return to Library</span>
          </Link>

          <Link
            id="not-found-search-btn"
            href="/search"
            prefetch
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 border border-line bg-surface-soft px-5 py-2.5 text-xs font-semibold text-ink-secondary transition hover:bg-white/[0.15] active:scale-95 sm:text-sm"
          >
            <IconCompass size={15} className="text-accent-ink" />
            <span>Discover Catalog</span>
          </Link>

          <Link
            id="not-found-dashboard-btn"
            href="/"
            prefetch
            className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 border border-line bg-white/[0.05] px-4 py-2.5 text-xs text-ink-secondary transition hover:bg-white/[0.10] active:scale-95 sm:text-sm"
          >
            <IconLayoutDashboard size={15} className="text-ink-muted" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
