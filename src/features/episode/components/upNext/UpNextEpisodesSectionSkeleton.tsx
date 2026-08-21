export const UpNextEpisodesSectionSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-zinc-800" />
          <div className="bg-zinc-850 h-5 w-8 animate-pulse rounded-full" />
        </div>
        <div className="bg-zinc-850 h-4 w-28 animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-zinc-850 space-y-3.5 rounded-2xl border bg-zinc-900/60 p-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="h-20 w-16 shrink-0 animate-pulse rounded-xl bg-zinc-800" />
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                <div className="bg-zinc-850 h-3 w-1/2 animate-pulse rounded" />
                <div className="bg-zinc-850/70 h-3 w-2/3 animate-pulse rounded" />
              </div>
            </div>
            <div className="border-zinc-850/80 flex items-center justify-between border-t pt-2">
              <div className="bg-zinc-850 h-3 w-20 animate-pulse rounded" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}