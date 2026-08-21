import { FC } from 'react';
import { UpNextEpisodesEmpty } from '@/features/show/components/upNext/UpNextEpisodesEmpty';
import { UpNextEpisodesList } from '@/features/show/components/upNext/UpNextEpisodesList';
import { UpNextEpisodesSectionHeader } from '@/features/show/components/upNext/UpNextEpisodesSectionHeader';
import { getUpNextEpisodes } from '@/features/episode';

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
