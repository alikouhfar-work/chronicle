export const SearchResultLoading = () => {
  return (
    <article className="animate-fade-in space-y-6 font-sans select-none">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-violet-400/40" />
          <div className="h-4 w-44 animate-pulse rounded-md bg-zinc-800" />
        </div>
        <div className="h-4 w-20 animate-pulse rounded-full bg-zinc-800" />
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="glass-card flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/8 shadow-xl"
          >
            {/* Poster Image Skeleton (3:4 aspect) */}
            <div className="relative aspect-3/4 w-full shrink-0 animate-pulse overflow-hidden bg-zinc-900">
              <div className="h-full w-full bg-zinc-800/80" />

              {/* Badges Overlay Skeleton */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <div className="h-5 w-12 rounded-full border border-white/10 bg-black/60" />
                <div className="h-5 w-10 rounded-full border border-white/10 bg-black/60" />
              </div>

              {/* Star Rating Badge Skeleton */}
              <div className="absolute top-2.5 right-2.5 h-5 w-10 rounded-full border border-white/10 bg-black/60" />
            </div>

            {/* Card Body Skeleton */}
            <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
              <div className="space-y-2">
                {/* Title */}
                <div className="h-4 w-4/5 animate-pulse rounded-md bg-zinc-700" />

                {/* Sub-meta tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <div className="h-4 w-14 rounded-full border border-violet-500/25 bg-violet-500/15" />
                  <div className="h-4 w-12 rounded-full border border-white/6 bg-white/4" />
                  <div className="h-4 w-14 rounded-full border border-white/6 bg-white/4" />
                </div>

                {/* Synopsis lines */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-full animate-pulse rounded-md bg-zinc-800" />
                  <div className="h-3 w-3/4 animate-pulse rounded-md bg-zinc-800/80" />
                </div>
              </div>

              {/* 3-Column Action Buttons Row */}
              <div className="border-t border-white/8 pt-2.5">
                <div className="grid w-full grid-cols-3 gap-1 rounded-full border border-white/8 bg-white/4 p-1">
                  <div className="h-6 animate-pulse rounded-full bg-white/6" />
                  <div className="h-6 animate-pulse rounded-full bg-white/6" />
                  <div className="h-6 animate-pulse rounded-full bg-white/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
