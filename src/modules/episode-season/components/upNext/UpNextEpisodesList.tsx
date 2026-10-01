import { UpNextEpisodeCard } from '@/modules/episode-season/components/upNext/UpNextEpisodeCard';
import { UpNextEpisodesListProps } from '@/modules/episode-season/types/upNextShowsList';

export const UpNextEpisodesList = ({ episodes }: UpNextEpisodesListProps) => {
  return (
    <ul className="space-y-3">
      {episodes.map((episode) => (
        <UpNextEpisodeCard episode={episode} key={`${episode.id}-next`} />
      ))}
    </ul>
  );
};
