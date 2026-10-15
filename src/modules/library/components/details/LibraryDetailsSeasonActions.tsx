'use client';

import { setSeasonWatched } from '@/modules/episode-season/actions/setSeasonWatched';
import { LibraryDetailsSeasonActionsProps } from '@/modules/library/types/libraryDetailsSeasonActions';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const LibraryDetailsSeasonActions = ({
  showId,
  seasonId,
  seasonWatched,
}: LibraryDetailsSeasonActionsProps) => {
  const { execute: toggleSeason, isPending } = useServerAction(
    () => setSeasonWatched(showId, seasonId, !seasonWatched),
    {
      errorMessage: seasonWatched
        ? 'Couldn’t clear the season. Please try again.'
        : 'Couldn’t mark the season as watched. Please try again.',
    },
  );

  return (
    <div className="flex items-center gap-1.5 self-end">
      <ActionButton
        onClick={toggleSeason}
        isPending={isPending}
        icon={
          seasonWatched ? (
            <IconCircleX size={13} className="text-zinc-400" />
          ) : (
            <IconCircleCheck size={13} className="text-violet-400" />
          )
        }
        aria-label={seasonWatched ? 'Clear season watched state' : 'Mark season as watched'}
        aria-pressed={seasonWatched}
        className={clsx(
          'apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
          seasonWatched
            ? 'bg-white/6 text-zinc-400 hover:bg-white/12 hover:text-white'
            : 'border border-violet-500/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25',
        )}
      >
        <span>{seasonWatched ? 'Clear Season' : 'Mark Season Watched'}</span>
      </ActionButton>
    </div>
  );
};
