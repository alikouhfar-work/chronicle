import { FC } from 'react';

export const UpNextEpisodeCardSkeleton: FC = () => {
  return (
    <li className="group border-zinc-850 relative flex flex-col items-start justify-between gap-5 rounded-xl border bg-zinc-900/40 p-5 transition-all duration-300 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
        <div
          className={`relative flex h-20 w-14 shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-linear-to-br p-2 shadow-md transition-all duration-300 select-none`}
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-black/40 via-transparent to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-zinc-850 h-7.5 w-70 max-w-full animate-pulse rounded-lg" />
              <div className="bg-zinc-850 h-7.25 w-17 max-w-full animate-pulse rounded-lg border border-zinc-700/40" />
              <div className="bg-zinc-850 h-3.75 w-18 max-w-full animate-pulse rounded" />
            </div>
            <div className="bg-zinc-850 mt-1 h-4 w-40 max-w-full animate-pulse rounded" />
          </div>
          <div className="bg-zinc-850 mt-1 h-4.75 w-7/8 max-w-full animate-pulse rounded" />
        </div>
      </div>

      <div className="bg-zinc-850 mt-1 h-9.5 w-40 max-w-full animate-pulse rounded-md" />
    </li>
  );
};
