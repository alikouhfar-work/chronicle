'use client';

import { IconCircleCheck, IconClock, IconDeviceTv, IconMovie } from '@tabler/icons-react';
import { FC } from 'react';
import { DashboardHeaderWatchStatsProps } from '@/app/(main)/(dashboard)/_types/dashboardHeader';
import { useWatchStats } from '@/app/(main)/(dashboard)/_hooks/useWatchStats';
import { formatMinutes } from '@/utils/formatMinutes';

export const DashboardHeaderWatchStats: FC<DashboardHeaderWatchStatsProps> = ({
  trackedShows,
  trackedMovies,
}) => {
  const { totalShowMinutes, totalMovieMinutes, episodesCount, moviesCount, completionRatePercent } =
    useWatchStats(trackedShows, trackedMovies);

  return (
    <div className="glass-card space-y-4 rounded-2xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-tight text-zinc-300">
          <IconClock size={15} className="text-violet-400" />
          <span>Watch Analytics</span>
        </span>
        <span className="apple-badge border border-violet-500/20 bg-violet-500/15 text-[11px] text-violet-400">
          Synced
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/6 bg-white/4 p-3 transition-all hover:border-white/15">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <IconDeviceTv size={12} className="text-violet-400" />
            Series Time
          </span>
          <p className="text-sm font-bold text-white">{formatMinutes(totalShowMinutes)}</p>
        </div>

        <div className="rounded-xl border border-white/6 bg-white/4 p-3 transition-all hover:border-white/15">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <IconMovie size={12} className="text-violet-400" />
            Movie Time
          </span>
          <p className="text-sm font-bold text-white">{formatMinutes(totalMovieMinutes)}</p>
        </div>

        <div className="rounded-xl border border-white/6 bg-white/4 p-3 transition-all hover:border-white/15">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <IconCircleCheck size={12} className="text-indigo-400" />
            Episodes
          </span>
          <p className="text-sm font-bold text-white">
            {episodesCount} <span className="text-xs font-normal text-zinc-500">watched</span>
          </p>
        </div>

        <div className="rounded-xl border border-white/6 bg-white/4 p-3 transition-all hover:border-white/15">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <IconMovie size={12} className="text-indigo-400" />
            Films
          </span>
          <p className="text-sm font-bold text-white">
            {moviesCount} <span className="text-xs font-normal text-zinc-500">logged</span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/8 pt-2">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-zinc-400">
          <span>Library Completion</span>
          <span className="font-bold text-violet-400">{completionRatePercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full rounded-full bg-linear-to-r from-violet-400 to-indigo-400 shadow-sm transition-all duration-500"
            style={{ width: `${completionRatePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
