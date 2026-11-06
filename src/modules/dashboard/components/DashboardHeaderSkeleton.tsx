
export const DashboardHeaderSkeleton = () => {
  return (
    <section className="glass-panel relative overflow-hidden rounded-card border border-line p-6 shadow-2xl md:p-8">
      <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="h-6 w-36 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
          <div className="space-y-2">
            <div className="h-9 w-3/4 animate-pulse rounded-control bg-surface-strong" />
            <div className="h-9 w-1/2 animate-pulse rounded-control bg-surface-strong" />
          </div>
          <div className="max-w-xl space-y-2 pt-1">
            <div className="h-3.5 w-full animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-3.5 w-5/6 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-xs bg-surface-strong/80" />
          </div>
        </div>

        {/* Right Status Widget Card */}
        <div className="glass-card space-y-4 rounded-card border border-line p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="h-4 w-28 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-4 w-14 animate-pulse rounded-pill bg-accent-bright/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="space-y-2 rounded-control border border-line bg-surface-soft p-3"
              >
                <div className="h-3 w-14 animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-5 w-16 animate-pulse rounded-xs bg-surface-strong" />
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-line pt-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 animate-pulse rounded-xs bg-surface-strong" />
              <div className="h-3 w-8 animate-pulse rounded-xs bg-accent-strong/40" />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-strong/80">
              <div className="h-full w-2/3 animate-pulse rounded-pill bg-gradient-to-r from-accent-bright to-secondary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
