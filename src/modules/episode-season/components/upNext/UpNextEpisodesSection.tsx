import { UpNextEpisodesSectionHeader } from '@/modules/episode-season/components/upNext/UpNextEpisodesSectionHeader';
import { UpNextEpisodesEmpty } from '@/modules/episode-season/components/upNext/UpNextEpisodesEmpty';
import { UpNextEpisodesList } from '@/modules/episode-season/components/upNext/UpNextEpisodesList';
import { getUpNextEpisodes } from '@/modules/episode-season/queries/getUpNextEpisodes';

export const UpNextEpisodesSection = async () => {
  const upNextEpisodes = await getUpNextEpisodes();

  return (
    <section className="space-y-4">
      <UpNextEpisodesSectionHeader upNextEpisodesCount={upNextEpisodes.length} />

      {upNextEpisodes.length === 0 ? (
        <UpNextEpisodesEmpty />
      ) : (
        <UpNextEpisodesList episodes={upNextEpisodes} />
      )}
    </section>
  );
};
