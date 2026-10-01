export const LibraryCardSkeleton = () => {
  return (
    <li className="group glass-card relative flex aspect-2/3 w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/8 p-4 shadow-xl">
      {/* Top Bar Skeleton */}
      <div className="z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
        </div>
        <div className="h-7 w-7 shrink-0 animate-pulse rounded-full border border-white/10 bg-black/60" />
      </div>

      {/* Bottom Content Skeleton */}
      <div className="z-10 space-y-2.5">
        <div className="space-y-1.5">
          <div className="h-3 w-16 animate-pulse rounded-md bg-violet-400/30" />
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-zinc-700" />
          <div className="h-3 w-3/5 animate-pulse rounded-md bg-zinc-800" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <div className="h-4 w-12 rounded-full border border-white/8 bg-white/6" />
          <div className="h-4 w-14 rounded-full border border-white/8 bg-white/6" />
        </div>

        {/* Progress / Rating Bar */}
        <div className="space-y-1.5 border-t border-white/10 pt-1.5">
          <div className="flex justify-between">
            <div className="h-2.5 w-12 rounded bg-zinc-800" />
            <div className="h-2.5 w-6 rounded bg-violet-400/40" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-linear-to-r from-violet-500 to-indigo-400" />
          </div>
        </div>
      </div>
    </li>
  );
};
