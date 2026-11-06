export const LibraryCardSkeleton = () => {
  return (
    <li className="group glass-card relative flex aspect-2/3 w-full flex-col justify-between overflow-hidden rounded-card border border-line p-4 shadow-xl">
      {/* Top Bar Skeleton */}
      <div className="z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
        </div>
        <div className="h-7 w-7 shrink-0 animate-pulse rounded-pill border border-line bg-black/60" />
      </div>

      {/* Bottom Content Skeleton */}
      <div className="z-10 space-y-2.5">
        <div className="space-y-1.5">
          <div className="h-3 w-16 animate-pulse rounded-xs bg-accent-strong/30" />
          <div className="h-4 w-4/5 animate-pulse rounded-xs bg-surface-strong" />
          <div className="h-3 w-3/5 animate-pulse rounded-xs bg-surface-strong" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <div className="h-4 w-12 rounded-pill border border-line bg-surface-soft" />
          <div className="h-4 w-14 rounded-pill border border-line bg-surface-soft" />
        </div>

        {/* Progress / Rating Bar */}
        <div className="space-y-1.5 border-t border-line pt-1.5">
          <div className="flex justify-between">
            <div className="h-2.5 w-12 rounded-xs bg-surface-strong" />
            <div className="h-2.5 w-6 rounded-xs bg-accent-strong/40" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-strong/80">
            <div className="h-full w-2/3 animate-pulse rounded-pill bg-linear-to-r from-accent-bright to-secondary" />
          </div>
        </div>
      </div>
    </li>
  );
};
