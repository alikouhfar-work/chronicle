import { FC } from 'react';

export const DashboardHeaderSkeleton: FC = async () => {
  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl border border-white/8 p-6 shadow-2xl md:p-8">
      <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="h-6 w-36 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
          <div className="space-y-2">
            <div className="h-9 w-3/4 animate-pulse rounded-xl bg-zinc-700" />
            <div className="h-9 w-1/2 animate-pulse rounded-xl bg-zinc-800" />
          </div>
          <div className="max-w-xl space-y-2 pt-1">
            <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3.5 w-5/6 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-md bg-zinc-800/80" />
          </div>
        </div>

        {/* Right Status Widget Card */}
        <div className="glass-card space-y-4 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div className="h-4 w-28 animate-pulse rounded-md bg-zinc-700" />
            <div className="h-4 w-14 animate-pulse rounded-full bg-violet-500/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-white/10 bg-white/4 p-3"
              >
                <div className="h-3 w-14 animate-pulse rounded-md bg-zinc-800" />
                <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-700" />
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-white/8 pt-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-3 w-8 animate-pulse rounded-md bg-violet-400/40" />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
