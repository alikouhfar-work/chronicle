export const LibraryCardSkeleton = () => {
  return (
    <li className="relative aspect-2/3 w-full animate-pulse overflow-hidden rounded-2xl bg-zinc-700 shadow-lg duration-1000">
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4.75 w-15 animate-pulse rounded bg-zinc-600 duration-1000" />
            <div className="h-4.75 w-20 animate-pulse rounded bg-zinc-600 duration-1000" />
          </div>
          <div className="size-4.5 animate-pulse rounded-full bg-zinc-600 duration-1000" />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="h-3 w-10 animate-pulse rounded-sm bg-zinc-600 duration-1000" />
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-600 duration-1000" />
          </div>

          <div className="flex flex-wrap gap-1">
            <div className="h-4.5 w-10 animate-pulse rounded bg-zinc-600 duration-1000" />
            <div className="h-4.5 w-20 animate-pulse rounded bg-zinc-600 duration-1000" />
          </div>

          <div className="space-y-1 border-t border-zinc-900/30 pt-1">
            <div className="flex justify-between font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
              <div className="h-3 w-10 animate-pulse rounded-sm bg-zinc-600 duration-1000" />
              <div className="h-3 w-5 animate-pulse rounded-sm bg-zinc-600 duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
