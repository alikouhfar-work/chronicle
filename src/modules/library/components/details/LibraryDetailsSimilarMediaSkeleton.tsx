export const LibraryDetailsSimilarMediaSkeleton = () => {
  return (
    <div className="space-y-3 lg:col-span-2">
      <div className="space-y-1">
        <div className="h-4 w-36 animate-pulse rounded-xs bg-surface-strong" />
        <div className="h-3 w-48 animate-pulse rounded-xs bg-surface-strong" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((sim) => (
          <div
            key={sim}
            className="glass-card flex flex-col justify-between overflow-hidden rounded-card border border-line"
          >
            <div className="relative flex h-24 w-full animate-pulse flex-col justify-between border-b border-line bg-surface-strong/80 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="h-4 w-12 rounded-pill bg-surface-soft-hover" />
                <div className="h-4 w-8 rounded-pill bg-surface-soft-hover" />
              </div>
              <div className="h-3.5 w-3/4 rounded-xs bg-surface-soft-hover" />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-3">
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3 w-5/6 animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3 w-2/3 animate-pulse rounded-xs bg-surface-strong/70" />
              </div>

              <div className="border-t border-line pt-2">
                <div className="h-7 w-full animate-pulse rounded-pill border border-accent-line bg-accent-bright/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}