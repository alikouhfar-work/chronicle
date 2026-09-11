const PersonDetailsPageLoading = () => {
  return (
    <article
      id="actor-details-skeleton"
      className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-12 font-sans select-none"
    >
      {/* Navigation Header Skeleton */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="h-8 w-32 animate-pulse rounded-full border border-white/10 bg-white/6" />
        <div className="h-6 w-24 animate-pulse rounded-full border border-white/10 bg-white/6" />
      </div>

      {/* Hero Glass Panel */}
      <div className="glass-panel relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8 md:flex-row">
        <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Profile Image Skeleton */}
        <div className="relative flex aspect-2/3 w-full shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/90 p-4 shadow-2xl md:w-60">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-16 rounded-full bg-white/10" />
            <div className="h-5 w-12 rounded-full bg-white/10" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-violet-400/30" />
            <div className="h-5 w-3/4 rounded bg-white/20" />
          </div>
        </div>

        {/* Info Column Skeleton */}
        <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Name and Department */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <div className="h-8 w-64 animate-pulse rounded-xl bg-zinc-700 md:h-10 md:w-80" />
                <div className="h-6 w-20 animate-pulse rounded-lg border border-violet-500/30 bg-violet-500/20" />
              </div>
              <div className="h-4 w-40 animate-pulse rounded-lg bg-zinc-800" />
            </div>

            {/* Badges / Meta row (Birthday, Place of Birth, Popularity) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="h-6 w-32 animate-pulse rounded-full border border-white/10 bg-white/6" />
              <div className="h-6 w-44 animate-pulse rounded-full border border-white/10 bg-white/6" />
              <div className="h-6 w-24 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
              <div className="h-6 w-20 animate-pulse rounded-full border border-white/10 bg-white/6" />
            </div>

            {/* Biography paragraph */}
            <div className="space-y-2.5 pt-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-700/80" />
              <div className="max-w-3xl space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-800" />
                <div className="h-3.5 w-11/12 animate-pulse rounded-md bg-zinc-800" />
                <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-zinc-800" />
                <div className="h-3.5 w-2/3 animate-pulse rounded-md bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filmography Section Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-700" />
            <div className="h-3.5 w-56 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>

        {/* Combined credits grid skeleton */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <li
              key={item}
              className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8"
            >
              {/* Poster Placeholder */}
              <div className="relative flex aspect-2/3 w-full animate-pulse flex-col justify-between border-b border-white/8 bg-zinc-800/80 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-5 w-12 rounded-full bg-white/10" />
                  <div className="h-5 w-10 rounded-full bg-white/10" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-white/20" />
                  <div className="h-3 w-1/2 rounded bg-white/10" />
                </div>
              </div>

              {/* Card Bottom Body */}
              <div className="space-y-2 p-3">
                <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-700" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-violet-400/20" />
                <div className="border-t border-white/8 pt-2">
                  <div className="h-7 w-full animate-pulse rounded-full bg-white/6" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default PersonDetailsPageLoading;
