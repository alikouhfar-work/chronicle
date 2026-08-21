const DashboardPageLoading = () => {
  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Bento Section Skeleton */}
      <div className="border-zinc-850 relative overflow-hidden rounded-2xl border bg-zinc-900/60 p-8 shadow-2xl md:p-10">
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-3">
          <div className="space-y-5 md:col-span-2">
            {/* Pill Tag */}
            <div className="h-5 w-40 animate-pulse rounded-full bg-zinc-800/80" />
            {/* Main Heading */}
            <div className="space-y-2">
              <div className="h-9 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
              <div className="h-9 w-1/2 animate-pulse rounded-lg bg-zinc-800/70" />
            </div>
            {/* Subtitle Lines */}
            <div className="max-w-xl space-y-2 pt-1">
              <div className="bg-zinc-850 h-3.5 w-full animate-pulse rounded" />
              <div className="bg-zinc-850 h-3.5 w-5/6 animate-pulse rounded" />
              <div className="bg-zinc-850/80 h-3.5 w-2/3 animate-pulse rounded" />
            </div>
          </div>

          {/* Right Status Widget Card */}
          <div className="hidden space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-2xl md:block">
            <div className="border-zinc-850 flex items-center justify-between border-b pb-2.5">
              <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-16 animate-pulse rounded bg-emerald-500/20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border-zinc-850 space-y-2 rounded-xl border bg-zinc-900/40 p-2.5"
                >
                  <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                  <div className="bg-zinc-750 h-5 w-20 animate-pulse rounded" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-b border-zinc-900 px-1 py-1">
              <div className="bg-zinc-850 h-3 w-28 animate-pulse rounded" />
              <div className="bg-zinc-850 h-3 w-16 animate-pulse rounded" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <div className="bg-zinc-850 h-3 w-20 animate-pulse rounded" />
                <div className="bg-zinc-850 h-3 w-8 animate-pulse rounded" />
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                <div className="bg-gold-500/30 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-zinc-850/90 relative space-y-3 overflow-hidden rounded-2xl border bg-zinc-900/50 p-5"
          >
            {/* Top Row: Title & Icon */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 animate-pulse rounded bg-zinc-800" />
              <div className="h-7 w-7 animate-pulse rounded-lg bg-zinc-800/80" />
            </div>
            {/* Big Stat Number */}
            <div className="bg-zinc-750 h-8 w-24 animate-pulse rounded-lg" />
            {/* Progress Bar / Subtext */}
            <div className="space-y-1 pt-1">
              <div className="bg-zinc-850 h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-zinc-750 h-full w-1/2 animate-pulse rounded-full" />
              </div>
              <div className="bg-zinc-850/80 h-3 w-32 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Up Next / Continue Watching Section */}
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

      {/* Release Forecast Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-52 animate-pulse rounded-lg bg-zinc-800" />
            <div className="bg-gold-500/10 h-5 w-20 animate-pulse rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="bg-zinc-850 h-7 w-16 animate-pulse rounded-lg" />
            <div className="bg-zinc-850 h-7 w-16 animate-pulse rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-zinc-850 space-y-3 rounded-2xl border bg-zinc-900/60 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-800" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800/80" />
              </div>
              <div className="bg-zinc-750 h-5 w-4/5 animate-pulse rounded" />
              <div className="space-y-1.5">
                <div className="bg-zinc-850 h-3 w-full animate-pulse rounded" />
                <div className="bg-zinc-850/80 h-3 w-3/4 animate-pulse rounded" />
              </div>
              <div className="border-zinc-850 flex items-center justify-between border-t pt-2">
                <div className="bg-zinc-850 h-3 w-20 animate-pulse rounded" />
                <div className="h-6 w-16 animate-pulse rounded-md bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Media Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-zinc-800" />
          <div className="bg-zinc-850 h-8 w-36 animate-pulse rounded-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-zinc-850 flex flex-col overflow-hidden rounded-2xl border bg-zinc-900/60"
            >
              {/* Poster Skeleton */}
              <div className="relative h-44 w-full animate-pulse bg-zinc-800/80">
                <div className="absolute top-2 right-2 h-5 w-12 animate-pulse rounded bg-zinc-950/80" />
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-2.5 p-4">
                <div className="space-y-1.5">
                  <div className="bg-zinc-750 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-zinc-850 h-3 w-1/2 animate-pulse rounded" />
                  <div className="bg-zinc-850/80 h-3 w-full animate-pulse rounded" />
                </div>
                <div className="border-zinc-850 border-t pt-2">
                  <div className="h-8 w-full animate-pulse rounded-lg bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log Section */}
      <div className="border-zinc-850 space-y-4 rounded-2xl border bg-zinc-900/60 p-6">
        <div className="border-zinc-850 flex items-center justify-between border-b pb-4">
          <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="bg-zinc-850 h-4 w-20 animate-pulse rounded" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-zinc-850/60 flex items-center justify-between rounded-xl border bg-zinc-950/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-zinc-800" />
                <div className="space-y-1">
                  <div className="h-3.5 w-48 animate-pulse rounded bg-zinc-800" />
                  <div className="bg-zinc-850 h-3 w-32 animate-pulse rounded" />
                </div>
              </div>
              <div className="bg-zinc-850 h-3 w-16 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default DashboardPageLoading;
