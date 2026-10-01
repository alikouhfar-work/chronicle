'use client';

import { IconCircleCheck } from '@tabler/icons-react';
import { MouseEventHandler } from 'react';
import { UpNextEpisodeCardWatchButtonProps } from '@/modules/episode-season/types/upNextEpisodeCardWatchButton';
import { toggleEpisodeWatched } from '@/modules/episode-season/actions/toggleEpisodeWatched';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const UpNextEpisodeCardWatchButton = ({
  showId,
  episodeId,
}: UpNextEpisodeCardWatchButtonProps) => {
  const { execute: markWatched, isPending } = useServerAction(toggleEpisodeWatched, {
    errorMessage: 'Couldn’t mark the episode as watched. Please try again.',
  });

  const handleWatchEpisode: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    markWatched(showId, episodeId);
  };

  return (
    <ActionButton
      onClick={handleWatchEpisode}
      isPending={isPending}
      icon={<IconCircleCheck size={14} />}
      title="Mark Episode as Watched"
      aria-label="Mark episode as watched"
      className="apple-pill-btn flex cursor-pointer items-center gap-1.5 bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 aria-busy:cursor-wait aria-busy:opacity-80"
    >
      <span>Watched</span>
    </ActionButton>
  );
};
