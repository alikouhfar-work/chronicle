'use client'

import { IconCircle, IconCircleCheck } from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { ShowDetailsEpisodeCardToggleButtonProps } from '@/features/episode/types/showDetailsEpisodeCardToggleButtonProps';
import { toggleEpisodeWatched } from '@/features/episode/actions/toggleEpisodeWatched';

export const ShowDetailsEpisodeCardToggleButton: FC<ShowDetailsEpisodeCardToggleButtonProps> = ({
  showId,
  episodeId,
  isWatched,
}) => {
  const [isEpisodePending, startEpisodeTransition] = useTransition();

  const handleToggleEpisode = (episodeId: string) => {
    startEpisodeTransition(async () => {
      await toggleEpisodeWatched(showId, episodeId);
    });
  };

  return (
    <button
      onClick={() => handleToggleEpisode(episodeId)}
      className={`mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
        isWatched
          ? 'bg-violet-500/15 text-violet-400'
          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
      }`}
      title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
    >
      {isEpisodePending ? (
        <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isWatched ? (
        <IconCircleCheck size={20} className="fill-violet-400/20" />
      ) : (
        <IconCircle size={20} />
      )}
    </button>
  );
};
