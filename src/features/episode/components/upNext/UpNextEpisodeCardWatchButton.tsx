'use client'

import { IconCircleCheck } from '@tabler/icons-react';
import { FC, MouseEventHandler, useTransition } from 'react';
import { toggleEpisodeWatched } from '@/features/show/actions/toggleEpisodeWatched';
import { UpNextEpisodeCardWatchButtonProps } from '@/features/show/types/upNextEpisodeCardWatchButton';

export const UpNextEpisodeCardWatchButton: FC<UpNextEpisodeCardWatchButtonProps> = ({
  showId,
  episodeId,
}) => {
  const [isEpisodePending, startEpisodeTransition] = useTransition();

  const handleWatchEpisode: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()

    startEpisodeTransition(async () => {
      await toggleEpisodeWatched(showId, episodeId);
    });
  };

  return (
    <button
      aria-busy={isEpisodePending}
      onClick={handleWatchEpisode}
      className="bg-gold-400 hover:bg-gold-300 shadow-gold-400/5 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-transparent px-4 py-2.5 font-mono text-[11px] font-extrabold tracking-wider text-zinc-950 uppercase shadow-lg transition-all aria-busy:cursor-wait aria-busy:opacity-70"
      title="Mark Episode as Watched"
    >
      <IconCircleCheck size={13} />
      <span>Mark as Watched</span>
    </button>
  );
};
