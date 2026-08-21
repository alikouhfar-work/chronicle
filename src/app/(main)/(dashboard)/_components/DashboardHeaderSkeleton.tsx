import { FC } from 'react';

export const DashboardHeaderSkeleton: FC = async () => {
  return (
    <header className="border-zinc-850 relative overflow-hidden rounded-2xl border bg-zinc-900/60 p-8 shadow-2xl md:p-10">
      <div className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-3">
        <div className="space-y-5 md:col-span-2">
          {/* Pill Tag */}
          <div className="h-6.25 w-52 animate-pulse rounded-full bg-gold-500/30" />
          {/* Main Heading */}
          <div className="h-15 w-4/5 animate-pulse rounded-lg bg-zinc-800" />

          {/* Subtitle Lines */}
          <div className="max-w-xl space-y-2 pt-1">
            <div className="bg-zinc-850 h-4 w-full animate-pulse rounded" />
            <div className="bg-zinc-850 h-4 w-5/6 animate-pulse rounded" />
            <div className="bg-zinc-850 h-4 w-2/3 animate-pulse rounded" />
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
                className="border-zinc-850 space-y-1.5 rounded-xl border bg-zinc-900/40 p-2.5"
              >
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                <div className="bg-zinc-750 h-4 w-20 animate-pulse rounded" />
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
    </header>
  );
};
