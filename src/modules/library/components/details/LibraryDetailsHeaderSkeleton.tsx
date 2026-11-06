
export const LibraryDetailsHeaderSkeleton = () => {
  return (
    <section className="glass-panel relative flex flex-col gap-7 overflow-hidden rounded-card border border-line p-6 shadow-2xl md:flex-row md:p-8">
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-pill bg-accent-bright/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-pill bg-info-soft blur-3xl" />

      {/* Poster Skeleton */}
      <div className="relative mx-auto flex aspect-2/3 w-full max-w-65 shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-card border border-line bg-surface-raised/90 p-4 shadow-2xl select-none sm:max-w-72 md:mx-0 md:w-56 md:max-w-none">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-16 rounded-pill bg-surface-soft-hover" />
          <div className="h-5 w-12 rounded-pill bg-surface-soft-hover" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-xs bg-surface-soft-hover" />
        </div>
      </div>

      {/* Info Column Details */}
      <div className="relative z-10 flex w-full min-w-0 flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Title and Subtitle */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <div className="h-8 w-64 animate-pulse rounded-control bg-surface-strong md:h-9 md:w-80" />
              <div className="h-6 w-16 animate-pulse rounded-xs border border-accent-line bg-accent-bright/20" />
            </div>
            <div className="h-4 w-44 animate-pulse rounded-xs bg-surface-strong" />
          </div>

          {/* Badges / Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-20 animate-pulse rounded-pill border border-line bg-surface-soft" />
            <div className="h-6 w-16 animate-pulse rounded-pill border border-line bg-surface-soft" />
            <div className="h-6 w-24 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
            <div className="h-6 w-20 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
            <div className="h-6 w-28 animate-pulse rounded-pill border border-line bg-surface-soft" />
          </div>

          {/* Synopsis paragraph */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-24 animate-pulse rounded-xs bg-surface-strong/80" />
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded-xs bg-surface-strong" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-xs bg-surface-strong" />
              <div className="h-3.5 w-4/5 animate-pulse rounded-xs bg-surface-strong/80" />
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col items-start justify-between gap-5 border-t border-line pt-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-xs bg-surface-strong" />
            <div className="flex flex-wrap gap-1 rounded-[20px] md:rounded-pill border border-line bg-surface-raised/90 p-1">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-7 w-20 animate-pulse rounded-pill bg-surface-soft" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
