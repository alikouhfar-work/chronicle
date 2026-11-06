const PersonDetailsPageLoading = () => {
  return (
    <article
      id="actor-details-skeleton"
      className="animate-fade-in mx-auto w-full space-y-8 pb-12 font-sans select-none"
    >
      {/* Navigation Header Skeleton */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="h-8 w-32 animate-pulse rounded-pill border border-line bg-surface-soft" />
        <div className="h-6 w-24 animate-pulse rounded-pill border border-line bg-surface-soft" />
      </div>

      {/* Hero Glass Panel */}
      <div className="glass-panel relative flex flex-col gap-8 overflow-hidden rounded-card border border-line p-6 shadow-2xl sm:p-8 md:flex-row">
        <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-pill bg-accent-bright/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-pill bg-info-soft blur-3xl" />

        {/* Profile Image Skeleton */}
        <div className="relative flex aspect-2/3 w-full shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-card border border-line bg-surface-raised/90 p-4 shadow-2xl md:w-60">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-16 rounded-pill bg-surface-soft-hover" />
            <div className="h-5 w-12 rounded-pill bg-surface-soft-hover" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-20 rounded-xs bg-accent-strong/30" />
            <div className="h-5 w-3/4 rounded-xs bg-surface-soft-hover" />
          </div>
        </div>

        {/* Info Column Skeleton */}
        <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Name and Department */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <div className="h-8 w-64 animate-pulse rounded-control bg-surface-strong md:h-10 md:w-80" />
                <div className="h-6 w-20 animate-pulse rounded-xs border border-accent-line bg-accent-bright/20" />
              </div>
              <div className="h-4 w-40 animate-pulse rounded-xs bg-surface-strong" />
            </div>

            {/* Badges / Meta row (Birthday, Place of Birth, Popularity) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="h-6 w-32 animate-pulse rounded-pill border border-line bg-surface-soft" />
              <div className="h-6 w-44 animate-pulse rounded-pill border border-line bg-surface-soft" />
              <div className="h-6 w-24 animate-pulse rounded-pill border border-accent-line bg-accent-bright/15" />
              <div className="h-6 w-20 animate-pulse rounded-pill border border-line bg-surface-soft" />
            </div>

            {/* Biography paragraph */}
            <div className="space-y-2.5 pt-2">
              <div className="h-3.5 w-24 animate-pulse rounded-xs bg-surface-strong/80" />
              <div className="space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3.5 w-11/12 animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3.5 w-4/5 animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3.5 w-2/3 animate-pulse rounded-xs bg-surface-strong" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filmography Section Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col justify-between gap-4 border-b border-line pb-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="h-5 w-40 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-3.5 w-56 animate-pulse rounded-xs bg-surface-strong" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 animate-pulse rounded-pill bg-surface-soft" />
            <div className="h-8 w-20 animate-pulse rounded-pill bg-surface-soft" />
            <div className="h-8 w-20 animate-pulse rounded-pill bg-surface-soft" />
          </div>
        </div>

        {/* Combined credits grid skeleton */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <li
              key={item}
              className="glass-card flex flex-col justify-between overflow-hidden rounded-card border border-line"
            >
              {/* Poster Placeholder */}
              <div className="relative flex aspect-2/3 w-full animate-pulse flex-col justify-between border-b border-line bg-surface-strong/80 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-5 w-12 rounded-pill bg-surface-soft-hover" />
                  <div className="h-5 w-10 rounded-pill bg-surface-soft-hover" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded-xs bg-surface-soft-hover" />
                  <div className="h-3 w-1/2 rounded-xs bg-surface-soft-hover" />
                </div>
              </div>

              {/* Card Bottom Body */}
              <div className="space-y-2 p-3">
                <div className="h-4 w-4/5 animate-pulse rounded-xs bg-surface-strong" />
                <div className="h-3 w-3/5 animate-pulse rounded-xs bg-accent-strong/20" />
                <div className="border-t border-line pt-2">
                  <div className="h-7 w-full animate-pulse rounded-pill bg-surface-soft" />
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
