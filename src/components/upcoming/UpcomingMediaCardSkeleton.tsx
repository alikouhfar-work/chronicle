export const UpcomingMediaCardSkeleton = () => {
  return (
    <li className="flex items-stretch gap-3 pl-1">
      <div className="space-y-1 py-2 text-right">
        <div className="ml-auto h-2.5 w-6 animate-pulse rounded bg-violet-400/40" />
        <div className="ml-auto h-4 w-5 animate-pulse rounded bg-zinc-700" />
      </div>
      <div className="glass-card flex flex-1 items-center gap-3 rounded-2xl border border-white/8 p-3">
        <div className="h-15 w-11 shrink-0 animate-pulse rounded-xl border border-white/10 bg-zinc-800/80" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-700" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-violet-500/15" />
          </div>
          <div className="h-3 w-40 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
    </li>
  );
};
