import { FC } from 'react';
import { UpNextEpisodesListProps } from '@/features/show/types/upNextShowsList';
import { UpNextEpisodeCard } from '@/features/show/components/upNext/UpNextEpisodeCard';

export const UpNextEpisodesList: FC<UpNextEpisodesListProps> = ({ episodes }) => {
  return (
    <ul className="space-y-4">
      {episodes.map((episode) => (
        <UpNextEpisodeCard key={`${episode.id}-next`} episode={episode} />
      ))}
    </ul>
  );
};
