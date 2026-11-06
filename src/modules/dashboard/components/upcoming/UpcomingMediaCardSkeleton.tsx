export const UpcomingMediaCardSkeleton = () => {
  return (
    <li className="flex items-stretch gap-3 pl-1">
      <div className="space-y-1 py-2 text-right">
        <div className="ml-auto h-2.5 w-6 animate-pulse rounded-xs bg-accent-strong/40" />
        <div className="ml-auto h-4 w-5 animate-pulse rounded-xs bg-surface-strong" />
      </div>
      <div className="glass-card flex flex-1 items-center gap-3 rounded-card border border-line p-3">
        <div className="h-15 w-11 shrink-0 animate-pulse rounded-control border border-line bg-surface-strong/80" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-x-2">
            <div className="h-4 w-32 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-4 w-16 animate-pulse rounded-pill bg-accent-bright/15" />
          </div>
          <div className="h-3 w-40 animate-pulse rounded-xs bg-surface-strong" />
        </div>
      </div>
    </li>
  );
};
