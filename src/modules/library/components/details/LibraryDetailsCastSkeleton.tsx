export const LibraryDetailsCastSkeleton = () => {
  return (
    <div className="space-y-3 lg:col-span-1">
      <div className="space-y-1">
        <div className="h-5 w-24 animate-pulse rounded-xs bg-surface-strong" />
        <div className="h-4 w-36 animate-pulse rounded-xs bg-surface-strong" />
      </div>

      <ul className="glass-card space-y-3.5 rounded-card border border-line p-4">
        {[1, 2, 3, 4].map((member) => (
          <li key={member} className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-pill border border-line bg-surface-strong" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3.5 w-28 animate-pulse rounded-xs bg-surface-strong" />
              <div className="h-3 w-20 animate-pulse rounded-xs bg-surface-strong/80" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
