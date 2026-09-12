import { FC } from 'react';

export const LibraryDetailsHeaderSkeleton: FC = () => {
  return (
    <section className="glass-panel relative flex flex-col gap-7 overflow-hidden rounded-3xl border border-white/8 p-6 shadow-2xl md:flex-row md:p-8">
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Poster Skeleton */}
      <div className="relative flex aspect-2/3 w-full shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/90 p-4 shadow-2xl select-none md:w-56">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-16 rounded-full bg-white/10" />
          <div className="h-5 w-12 rounded-full bg-white/10" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-white/20" />
        </div>
      </div>

      {/* Info Column Details */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Title and Subtitle */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <div className="h-8 w-64 animate-pulse rounded-xl bg-zinc-700 md:h-9 md:w-80" />
              <div className="h-6 w-16 animate-pulse rounded-lg border border-violet-500/30 bg-violet-500/20" />
            </div>
            <div className="h-4 w-44 animate-pulse rounded-lg bg-zinc-800" />
          </div>

          {/* Badges / Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full border border-white/10 bg-white/6" />
            <div className="h-6 w-16 animate-pulse rounded-full border border-white/10 bg-white/6" />
            <div className="h-6 w-24 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
            <div className="h-6 w-20 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
            <div className="h-6 w-28 animate-pulse rounded-full border border-white/10 bg-white/6" />
          </div>

          {/* Synopsis paragraph */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-700/80" />
            <div className="max-w-3xl space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-800" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-zinc-800/80" />
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col items-start justify-between gap-5 border-t border-white/8 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
            <div className="flex flex-wrap gap-1 rounded-[20px] md:rounded-full border border-white/10 bg-zinc-900/90 p-1">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-7 w-20 animate-pulse rounded-full bg-white/6" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
