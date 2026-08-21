export const TrendingMediaCardSkeleton = () => {
  return (
    <li className="group border-zinc-850 hover:border-zinc-750/80 relative flex min-w-70 flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-900/40 shadow-md transition-all duration-300 hover:bg-zinc-900/90">
      <div className="border-zinc-850/50 relative aspect-video w-full shrink-0 overflow-hidden border-b select-none">
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4.5">
          <div className="bg-gold-400/30 text-gold-400 border-gold-400/50 ml-auto h-3.5 w-7 animate-pulse rounded border" />
          <div className="bg-zinc-850 h-5 w-12 animate-pulse rounded" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <div className="bg-zinc-850 h-5.5 w-12 animate-pulse rounded" />
            <div className="bg-zinc-850 h-5.5 w-16 animate-pulse rounded" />
            <div className="bg-zinc-850 h-5.5 w-14 animate-pulse rounded" />
          </div>

          <div className="space-y-0.5">
            <div className="bg-zinc-850 h-4.25 w-full animate-pulse rounded" />
            <div className="bg-zinc-850 h-4.25 w-full animate-pulse rounded" />
            <div className="bg-zinc-850 h-4.25 w-3/4 animate-pulse rounded" />
          </div>
        </div>

        <div className="border-zinc-850/40 flex items-center justify-between gap-2 border-t bg-transparent pt-3">
          <div className="bg-zinc-850 h-3.25 w-11.5 animate-pulse rounded" />
          <div className="bg-gold-400/30 h-6.75 w-17 animate-pulse rounded-lg" />
        </div>
      </div>
    </li>
  );
};
