export const TrendingMediaCardSkeleton = () => {
  return (
    <li className="glass-card flex min-w-70 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/8 shadow-xl sm:w-[320px]">
      <div className="relative flex h-32 w-full animate-pulse flex-col justify-between overflow-hidden border-b border-white/8 bg-zinc-800/80 p-3.5">
        <div className="h-4 w-10 self-end rounded-full border border-white/10 bg-black/60" />
        <div className="h-4 w-3/4 rounded-md bg-zinc-700" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded-md bg-zinc-800" />
          <div className="h-3 w-full animate-pulse rounded-md bg-zinc-800/80" />
          <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-800/80" />
        </div>
        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <div className="h-3 w-16 animate-pulse rounded-md bg-zinc-800" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-violet-500/25" />
        </div>
      </div>
    </li>
  );
};
