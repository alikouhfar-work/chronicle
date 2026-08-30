'use client';

import { IconCircleCheck, IconLoader2 } from '@tabler/icons-react';
import { FC, MouseEventHandler, useTransition } from 'react';
import { toggleEpisodeWatched } from '@/features/show/actions/toggleEpisodeWatched';
import { UpNextEpisodeCardWatchButtonProps } from '@/features/episode/types/upNextEpisodeCardWatchButton';

export const UpNextEpisodeCardWatchButton: FC<UpNextEpisodeCardWatchButtonProps> = ({
  showId,
  episodeId,
}) => {
  const [isEpisodeWatchPending, startEpisodeWatchTransition] = useTransition();

  const handleWatchEpisode: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    startEpisodeWatchTransition(async () => {
      await toggleEpisodeWatched(showId, episodeId);
    });
  };

  return (
    <button
      onClick={handleWatchEpisode}
      aria-busy={isEpisodeWatchPending}
      className="apple-pill-btn flex cursor-pointer items-center gap-1.5 bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 aria-busy:cursor-wait aria-busy:opacity-80"
      title="Mark Episode as Watched"
    >
      {isEpisodeWatchPending ? (
        <IconLoader2 size={14} className="animate-spin" />
      ) : (
        <IconCircleCheck size={14} />
      )}
      <span>Watched</span>
    </button>
  );
};
