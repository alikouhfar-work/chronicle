'use client'

import { IconCircle, IconCircleCheck } from '@tabler/icons-react';
import { ShowDetailsEpisodeCardToggleButtonProps } from '@/modules/episode-season/types/showDetailsEpisodeCardToggleButtonProps';
import { toggleEpisodeWatched } from '@/modules/episode-season/actions/toggleEpisodeWatched';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const ShowDetailsEpisodeCardToggleButton = ({
  showId,
  episodeId,
  isWatched,
}: ShowDetailsEpisodeCardToggleButtonProps) => {
  const { execute: toggleEpisode, isPending } = useServerAction(toggleEpisodeWatched, {
    errorMessage: 'Couldn’t update the episode. Please try again.',
  });

  return (
    <ActionButton
      onClick={() => toggleEpisode(showId, episodeId)}
      isPending={isPending}
      pendingIcon={
        <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      }
      icon={
        isWatched ? (
          <IconCircleCheck size={20} className="fill-violet-400/20" />
        ) : (
          <IconCircle size={20} />
        )
      }
      aria-pressed={isWatched}
      aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
      title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
      className={`mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
        isWatched
          ? 'bg-violet-500/15 text-violet-400'
          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
      }`}
    />
  );
};
