
export const UpNextEpisodeCardSkeleton = () => {
  return (
    <li className="glass-card flex flex-col items-start justify-between gap-4 rounded-card border border-line p-4 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
        <div className="relative flex h-20 w-16 shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-control border border-line bg-surface-strong/80 p-2 shadow-card">
          <div className="h-2 w-4 self-end rounded-pill bg-surface-strong" />
          <div className="mx-auto h-3 w-10 rounded-pill bg-accent-strong/30" />
          <div className="h-1.5 w-full rounded-pill bg-surface-strong" />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-5 w-40 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-5 w-24 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
          </div>
          <div className="h-4 w-48 animate-pulse rounded-xs bg-surface-strong" />
          <div className="max-w-xl space-y-1.5 pt-0.5">
            <div className="h-3 w-full animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-3 w-3/4 animate-pulse rounded-xs bg-surface-strong" />
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2.5 border-t border-line pt-3 md:w-auto md:border-t-0 md:pt-0">
        <div className="h-8 w-24 animate-pulse rounded-pill border border-line bg-surface-soft" />
        <div className="h-8 w-24 animate-pulse rounded-pill bg-accent-bright/30" />
      </div>
    </li>
  );
};
