import { IconDeviceTv } from '@tabler/icons-react';
import { FC } from 'react';
import { getUpcomingEpisodes } from '@/features/episode';
import { UpcomingMediaSection } from '@/components/upcoming/UpcomingMediaSection';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';

export const UpcomingEpisodeList: FC = async () => {
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
        if (media.episodes.length === 1) {
          const episode = media.episodes[0];

          return `Season ${episode.seasonNumber}, Episode ${episode.episodeNumber} - ${episode.name}`;
        }

        const firstEpisode = media.episodes[0];
        const lastEpisode = media.episodes.at(-1);

        if (firstEpisode.seasonNumber === lastEpisode?.seasonNumber) {
          return `Season ${firstEpisode.seasonNumber}, Episode ${firstEpisode.episodeNumber} to Episode ${lastEpisode.episodeNumber}`;
        }

        return `Episode ${firstEpisode.episodeNumber} to Episode ${lastEpisode?.episodeNumber}`;
      }}
    />
  );
};
