import { FC } from 'react';
import { UpNextEpisodeCard } from '@/features/episode/components/upNext/UpNextEpisodeCard';
import { UpNextEpisodesListProps } from '@/features/episode/types/upNextShowsList';

export const UpNextEpisodesList: FC<UpNextEpisodesListProps> = ({ episodes }) => {
  return (
    <ul className="space-y-3">
      {episodes.map((episode) => (
        <UpNextEpisodeCard episode={episode} key={`${episode.id}-next`} />
      ))}
    </ul>
  );
};
