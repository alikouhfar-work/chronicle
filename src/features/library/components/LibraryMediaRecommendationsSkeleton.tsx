export const LibraryMediaRecommendationsSkeleton = () => {
  return (
    <div className="space-y-3 lg:col-span-2">
      <div className="space-y-1">
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-700" />
        <div className="h-3 w-48 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((sim) => (
          <div
            key={sim}
            className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08]"
          >
            <div className="relative flex h-24 w-full animate-pulse flex-col justify-between border-b border-white/[0.08] bg-zinc-800/80 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="h-4 w-12 rounded-full bg-white/10" />
                <div className="h-4 w-8 rounded-full bg-white/10" />
              </div>
              <div className="h-3.5 w-3/4 rounded bg-white/20" />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-3">
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800/70" />
              </div>

              <div className="border-t border-white/[0.08] pt-2">
                <div className="h-7 w-full animate-pulse rounded-full border border-violet-500/30 bg-violet-500/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}