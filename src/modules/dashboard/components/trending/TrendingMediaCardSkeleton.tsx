export const TrendingMediaCardSkeleton = () => {
  return (
    <li className="glass-card flex min-w-70 shrink-0 flex-col justify-between overflow-hidden rounded-card border border-line shadow-xl sm:w-[320px]">
      <div className="relative flex h-32 w-full animate-pulse flex-col justify-between overflow-hidden border-b border-line bg-surface-strong/80 p-3.5">
        <div className="h-4 w-10 self-end rounded-pill border border-line bg-black/60" />
        <div className="h-4 w-3/4 rounded-xs bg-surface-strong" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded-xs bg-surface-strong" />
          <div className="h-3 w-full animate-pulse rounded-xs bg-surface-strong/80" />
          <div className="h-3 w-4/5 animate-pulse rounded-xs bg-surface-strong/80" />
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <div className="h-3 w-16 animate-pulse rounded-xs bg-surface-strong" />
          <div className="h-7 w-16 animate-pulse rounded-pill bg-accent-bright/25" />
        </div>
      </div>
    </li>
  );
};
