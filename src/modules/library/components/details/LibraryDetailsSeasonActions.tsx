'use client';

import { setSeasonWatched } from '@/modules/episode-season/actions/setSeasonWatched';
import { LibraryDetailsSeasonActionsProps } from '@/modules/library/types/libraryDetailsSeasonActions';
import { IconCircleCheck, IconEye, IconEyeCheck } from '@tabler/icons-react';
import { setShowWatched } from '@/modules/show/actions/setShowWatched';
import { clsx } from 'clsx';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const LibraryDetailsSeasonActions = ({
  showId,
  seasonId,
  seriesWatched,
}: LibraryDetailsSeasonActionsProps) => {
  const { execute: watchSeason, isPending: isWatchSeasonPending } = useServerAction(
    () => setSeasonWatched(showId, seasonId, true),
    { errorMessage: 'Couldn’t mark the season as watched. Please try again.' },
  );
  const { execute: watchShow, isPending: isWatchShowPending } = useServerAction(
    () => setShowWatched(showId, !seriesWatched),
    { errorMessage: 'Couldn’t update the show. Please try again.' },
  );
  const { execute: clearSeason, isPending: isClearSeasonPending } = useServerAction(
    () => setSeasonWatched(showId, seasonId, false),
    { errorMessage: 'Couldn’t clear the season. Please try again.' },
  );

  return (
    <div className="flex items-center gap-1.5 self-end">
      <ActionButton
        onClick={watchShow}
        isPending={isWatchShowPending}
        disabled={isClearSeasonPending || isWatchSeasonPending}
        icon={
          seriesWatched ? (
            <IconEyeCheck size={14} className="text-emerald-400" />
          ) : (
            <IconEye size={14} className="text-violet-400" />
          )
        }
        aria-label={seriesWatched ? 'Mark show as not watched' : 'Mark entire show as watched'}
        className={clsx(
          'apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1 pl-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
          seriesWatched
            ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            : 'border border-violet-500/35 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30',
        )}
      >
        <span>{seriesWatched ? 'Show Watched' : 'Mark Show Watched'}</span>
      </ActionButton>

      <ActionButton
        onClick={watchSeason}
        isPending={isWatchSeasonPending}
        disabled={isClearSeasonPending || isWatchShowPending}
        icon={<IconCircleCheck size={13} className="text-violet-400" />}
        aria-label="Mark season as watched"
        className="apple-pill-btn flex cursor-pointer items-center gap-1.5 border border-violet-500/30 bg-violet-500/15 px-3 py-1 pl-2 text-xs text-violet-300 hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <span>Mark Season Watched</span>
      </ActionButton>

      <ActionButton
        onClick={clearSeason}
        isPending={isClearSeasonPending}
        disabled={isWatchSeasonPending || isWatchShowPending}
        aria-label="Clear season watched state"
        className="apple-pill-btn flex cursor-pointer items-center gap-1.5 bg-white/6 px-3 py-1 text-xs text-zinc-400 hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <span>Clear Season</span>
      </ActionButton>
    </div>
  );
};
