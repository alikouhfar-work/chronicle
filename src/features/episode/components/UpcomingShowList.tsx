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
      upcomingMedia={upcomingEpisodes}
      sectionTitle="TV Series & Seasons"
      sectionSubtitle="Next episodes and season premiere forecasts"
      emptySectionTitle="No Upcoming TV Series Forecasted"
      emptySectionSubtitle="Track television series in your library to unlock automated next-episode countdowns and season premiere forecasts."
      getTitle={(media) => media.showName}
      getSubtitle={(media) => `Season ${media.seasonNumber}, Episode ${media.episodeNumber} - ${media.name}`}
    />
  );
};
