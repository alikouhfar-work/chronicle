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
      getSubtitle={(media) =>
        `Season ${media.seasonNumber}, Episode ${media.episodeNumber} - ${media.name}`
      }
    />
  );
};
