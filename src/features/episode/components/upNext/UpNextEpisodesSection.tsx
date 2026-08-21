import { FC } from 'react';
import { getUpNextEpisodes } from '@/features/episode';
import { UpNextEpisodesSectionHeader } from '@/features/episode/components/upNext/UpNextEpisodesSectionHeader';
import { UpNextEpisodesEmpty } from '@/features/episode/components/upNext/UpNextEpisodesEmpty';
import { UpNextEpisodesList } from '@/features/episode/components/upNext/UpNextEpisodesList';

export const UpNextEpisodesSection: FC = async () => {
  const upNextEpisodes = await getUpNextEpisodes();

  return (
    <section className="space-y-6">
      <UpNextEpisodesSectionHeader upNextShowsLength={upNextEpisodes.length} />

      {upNextEpisodes.length === 0 ? (
        <UpNextEpisodesEmpty />
      ) : (
        <UpNextEpisodesList episodes={upNextEpisodes} />
      )}
    </section>
  );
};
