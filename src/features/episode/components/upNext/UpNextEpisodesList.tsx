import { FC } from 'react';
import { UpNextEpisodeCard } from '@/features/episode/components/upNext/UpNextEpisodeCard';
import { UpNextEpisodesListProps } from '@/features/episode/types/upNextShowsList';

export const UpNextEpisodesList: FC<UpNextEpisodesListProps> = ({ episodes }) => {
  return (
    <ul className="space-y-4">
      {episodes.map((episode) => (
        <UpNextEpisodeCard key={`${episode.id}-next`} episode={episode} />
      ))}
    </ul>
  );
};
