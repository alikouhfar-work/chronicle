import { FC } from 'react';

export const UpNextEpisodeCardSkeleton: FC = () => {
  return (
    <li className="glass-card flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/8 p-4 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
        <div className="relative flex h-20 w-16 shrink-0 animate-pulse flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-zinc-800/80 p-2 shadow-md">
          <div className="h-2 w-4 self-end rounded-full bg-zinc-700" />
          <div className="mx-auto h-3 w-10 rounded-full bg-violet-400/30" />
          <div className="h-1.5 w-full rounded-full bg-zinc-700" />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-5 w-40 animate-pulse rounded-md bg-zinc-700" />
            <div className="h-5 w-24 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
          </div>
          <div className="h-4 w-48 animate-pulse rounded-md bg-zinc-800" />
          <div className="max-w-xl space-y-1.5 pt-0.5">
            <div className="h-3 w-full animate-pulse rounded-md bg-zinc-800" />
            <div className="h-3 w-3/4 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2.5 border-t border-white/8 pt-3 md:w-auto md:border-t-0 md:pt-0">
        <div className="h-8 w-24 animate-pulse rounded-full border border-white/10 bg-white/6" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-violet-500/30" />
      </div>
    </li>
  );
};
