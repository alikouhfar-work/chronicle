'use client';

import { FC, useTransition } from 'react';
import { setSeasonWatched } from '@/features/season/actions/setSeasonWatched';
import { LibraryDetailsSeasonActionsProps } from '@/features/library/types/libraryDetailsSeasonActions';
import { IconCircleCheck, IconEye, IconEyeCheck } from '@tabler/icons-react';
import { setShowWatched } from '@/features/show/actions/setShowWatched';
import { clsx } from 'clsx';

export const LibraryDetailsSeasonActions: FC<LibraryDetailsSeasonActionsProps> = ({
  showId,
  seasonId,
  seriesWatched,
}) => {
  const [isWatchSeasonPending, startWatchSeasonTransition] = useTransition();
  const [isWatchShowPending, startWatchShowTransition] = useTransition();
  const [isClearSeasonPending, startClearSeasonTransition] = useTransition();

  const handleWatchSeason = () => {
    startWatchSeasonTransition(async () => await setSeasonWatched(showId, seasonId, true));
  };

  const handleWatchShow = () => {
    startWatchShowTransition(async () => await setShowWatched(showId, !seriesWatched));
  };

  const handleClearSeason = async () => {
    startClearSeasonTransition(async () => await setSeasonWatched(showId, seasonId, false));
  };

  return (
    <div className="flex items-center gap-1.5 self-end">
      <button
        onClick={handleWatchShow}
        aria-busy={isWatchShowPending}
        disabled={isClearSeasonPending || isWatchSeasonPending}
        className={clsx(
          'apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1 pl-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
          seriesWatched
            ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            : 'border border-violet-500/35 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30',
        )}
      >
        {seriesWatched ? (
          <IconEyeCheck size={14} className="text-emerald-400" />
        ) : (
          <IconEye size={14} className="text-violet-400" />
        )}
        <span>{seriesWatched ? 'Show Watched' : 'Mark Show Watched'}</span>
      </button>

      <button
        onClick={handleWatchSeason}
        aria-busy={isWatchSeasonPending}
        disabled={isClearSeasonPending || isWatchShowPending}
        className="apple-pill-btn flex cursor-pointer items-center gap-1.5 border border-violet-500/30 bg-violet-500/15 px-3 py-1 pl-2 text-xs text-violet-300 hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <IconCircleCheck size={13} className="text-violet-400" />
        <span>Mark Season Watched</span>
      </button>

      <button
        onClick={handleClearSeason}
        aria-busy={isClearSeasonPending}
        disabled={isWatchSeasonPending || isWatchShowPending}
        className="apple-pill-btn flex cursor-pointer items-center gap-1.5 bg-white/6 px-3 py-1 text-xs text-zinc-400 hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <span>Clear Season</span>
      </button>
    </div>
  );
};
