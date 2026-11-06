import { IconDeviceTv } from '@tabler/icons-react';
import { UpcomingMediaSection } from '@/modules/dashboard/components/upcoming/UpcomingMediaSection';
import type { MappedUpcomingEpisode } from '@/modules/episode-season/types/upcomingEpisode';
import { getUpcomingEpisodes } from '@/modules/episode-season/services/getUpcomingEpisodes';

export const UpcomingEpisodeList = async () => {
  const upcomingEpisodes = await getUpcomingEpisodes();

  return (
    <UpcomingMediaSection<MappedUpcomingEpisode>
      icon={IconDeviceTv}
      mediaType="tv"
      upcomingMedia={upcomingEpisodes}
      sectionTitle="TV Series Premieres"
      sectionSubtitle="New seasons & upcoming episode drops"
      emptySectionTitle="No Upcoming TV Premieres"
      emptySectionSubtitle="Add more series to your library to track upcoming season release dates."
      getTitle={(media) => media.showName}
      getSubtitle={(media) => {
        const firstEpisode = media.episodes[0];
        const lastEpisode = media.episodes.at(-1);

        if (!firstEpisode) return media.showName;

        if (media.episodes.length === 1) {
          return `Season ${firstEpisode.seasonNumber}, Episode ${firstEpisode.episodeNumber} - ${firstEpisode.name}`;
        }

        if (firstEpisode.seasonNumber === lastEpisode?.seasonNumber) {
          return `Season ${firstEpisode.seasonNumber}, Episode ${firstEpisode.episodeNumber} to Episode ${lastEpisode.episodeNumber}`;
        }

        return `Episode ${firstEpisode.episodeNumber} to Episode ${lastEpisode?.episodeNumber}`;
      }}
    />
  );
};
