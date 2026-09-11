export const LibraryMediaCreditsSkeleton = () => {
  return (
    <div className="space-y-3 lg:col-span-1">
      <div className="space-y-1">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-700" />
        <div className="h-3 w-36 animate-pulse rounded bg-zinc-800" />
      </div>

      <ul className="glass-card space-y-3.5 rounded-2xl border border-white/8 p-4">
        {[1, 2, 3, 4].map((member) => (
          <li key={member} className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full border border-white/10 bg-zinc-800" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3.5 w-28 animate-pulse rounded bg-zinc-700" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-800/80" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
