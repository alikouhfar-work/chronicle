'use client';

import {
  IconCircleCheck,
  IconClock,
  IconDeviceTv,
  IconMovie,
  IconSparkles,
} from '@tabler/icons-react';
import { FC } from 'react';
import { DashboardHeaderWatchStatsProps } from '@/app/(main)/(dashboard)/_types/dashboardHeader';
import { useWatchStats } from '@/app/(main)/(dashboard)/_hooks/useWatchStats';
import { formatMinutes } from '@/utils/formatMinutes';

export const DashboardHeaderWatchStats: FC<DashboardHeaderWatchStatsProps> = ({
  trackedShows,
  trackedMovies,
}) => {
  const {
    totalShowMinutes,
    totalMovieMinutes,
    episodesCount,
    moviesCount,
    activeShowsCount,
    totalCompletedCount,
    totalLibraryCount,
    completionRatePercent,
  } = useWatchStats(trackedShows, trackedMovies);

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-lg">
      <div className="border-zinc-850 flex items-center justify-between border-b pb-2.5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          <IconSparkles size={11} className="text-gold-400" />
          Chronicle Intelligence
        </span>
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase">
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border-zinc-850 hover:border-gold-500/20 group/stat space-y-0.5 rounded-xl border bg-zinc-900/40 p-2.5 transition-all">
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            <IconClock
              size={10}
              className="text-gold-400/80 group-hover/stat:text-gold-400 transition-colors"
            />
            TV Airtime
          </span>
          <p className="font-serif text-xs leading-tight font-black text-white">
            {formatMinutes(totalShowMinutes)}
          </p>
        </div>

        <div className="border-zinc-850 hover:border-gold-500/20 group/stat space-y-0.5 rounded-xl border bg-zinc-900/40 p-2.5 transition-all">
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            <IconMovie
              size={10}
              className="text-gold-400/80 group-hover/stat:text-gold-400 transition-colors"
            />
            Film Airtime
          </span>
          <p className="font-serif text-xs leading-tight font-black text-white">
            {formatMinutes(totalMovieMinutes)}
          </p>
        </div>

        <div className="border-zinc-850 hover:border-gold-500/20 group/stat space-y-0.5 rounded-xl border bg-zinc-900/40 p-2.5 transition-all">
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            <IconDeviceTv
              size={10}
              className="text-gold-400/80 group-hover/stat:text-gold-400 transition-colors"
            />
            Eps Logged
          </span>
          <p className="font-serif text-xs leading-tight font-black text-white">
            {episodesCount} <span className="font-mono text-[9px] text-zinc-500">eps</span>
          </p>
        </div>

        <div className="border-zinc-850 hover:border-gold-500/20 group/stat space-y-0.5 rounded-xl border bg-zinc-900/40 p-2.5 transition-all">
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            <IconCircleCheck
              size={10}
              className="text-gold-400/80 group-hover/stat:text-gold-400 transition-colors"
            />
            Films Logged
          </span>
          <p className="font-serif text-xs leading-tight font-black text-white">
            {moviesCount} <span className="font-mono text-[9px] text-zinc-500">films</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-b border-zinc-900/80 px-1 py-1.5 font-mono text-[9px]">
        <div className="flex gap-2">
          <span className="text-zinc-500">
            <strong className="font-bold text-zinc-300">{activeShowsCount}</strong> watching
          </span>
          <span className="text-zinc-500">
            <strong className="font-bold text-zinc-300">{totalCompletedCount}</strong> done
          </span>
        </div>
        <span className="font-bold text-zinc-400">{totalLibraryCount} cataloged</span>
      </div>

      <div className="pt-1">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
          <span>Completion Status</span>
          <span className="text-gold-400 font-bold">{completionRatePercent}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-900">
          <div
            className="from-gold-500 to-gold-400 h-1 rounded-full bg-linear-to-r transition-all duration-500"
            style={{ width: `${completionRatePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
