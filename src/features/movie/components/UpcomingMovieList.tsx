import { IconDeviceTv } from '@tabler/icons-react';
import { FC } from 'react';
import { getUpcomingEpisodes } from '@/features/episode';
import { UpcomingMediaSection } from '@/components/upcoming/UpcomingMediaSection';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';

export const UpcomingShowList: FC = async () => {
  const upcomingEpisodes = await getUpcomingEpisodes();

  return (
    <UpcomingMediaSection<MappedUpcomingEpisode>
      icon={IconDeviceTv}
      title="TV Series & Seasons"
      upcomingMedia={upcomingEpisodes}
      subtitle="Next episodes and season premiere forecasts"
    />
  );
};
