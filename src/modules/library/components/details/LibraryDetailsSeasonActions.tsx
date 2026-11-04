'use client';

import { useState } from 'react';
import { setSeasonWatched } from '@/modules/episode-season/actions/setSeasonWatched';
import { LibraryDetailsSeasonActionsProps } from '@/modules/library/types/libraryDetailsSeasonActions';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { RewatchButton, WatchActionModal } from '@/modules/rewatch';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

/**
 * Season header actions. Marking an unwatched season stays a single click;
 * clicking an already-watched season opens the rewatch/unwatch confirmation,
 * exactly like the episode cards.
 */
export const LibraryDetailsSeasonActions = ({
  showId,
  seasonId,
  seasonName,
  seasonWatched,
  seasonRewatchCount,
}: LibraryDetailsSeasonActionsProps) => {
  const [optimistic, setOptimistic] = useState<{ watched: boolean; count: number } | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const watched = optimistic?.watched ?? seasonWatched;
  const count = optimistic?.count ?? seasonRewatchCount;
  const displayCount = Math.max(count, watched ? 1 : 0);

  const { execute: markSeasonWatched, isPending } = useServerAction(
    () => setSeasonWatched(showId, seasonId, true),
    { errorMessage: 'Couldn’t mark the season as watched. Please try again.' },
  );

  const handleClick = () => {
    if (watched) {
      setIsOptionsOpen(true);
      return;
    }

    void markSeasonWatched();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 self-end">
      {isOptionsOpen && (
        <WatchActionModal
          mediaType="season"
          mediaId={seasonId}
          title={seasonName}
          watchCount={displayCount}
          onRewatch={(nextCount) => setOptimistic({ watched: true, count: nextCount })}
          onUnwatch={(nextCount) => setOptimistic({ watched: false, count: nextCount })}
          onClose={() => setIsOptionsOpen(false)}
        />
      )}

      <RewatchButton
        mediaType="season"
        mediaId={seasonId}
        initialCount={displayCount}
        historyTitle={seasonName}
        variant="compact"
      />
      <ActionButton
        onClick={handleClick}
        isPending={isPending}
        aria-haspopup={watched ? 'dialog' : undefined}
        icon={
          watched ? (
            <IconCircleX size={13} className="text-zinc-400" />
          ) : (
            <IconCircleCheck size={13} className="text-violet-400" />
          )
        }
        aria-label={watched ? `Season options for ${seasonName}` : 'Mark season as watched'}
        aria-pressed={watched}
        className={clsx(
          'apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
          watched
            ? 'bg-white/6 text-zinc-400 hover:bg-white/12 hover:text-white'
            : 'border border-violet-500/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25',
        )}
      >
        <span>{watched ? 'Season Watched' : 'Mark Season Watched'}</span>
      </ActionButton>
    </div>
  );
};
