import { IconDeviceTv } from '@tabler/icons-react';
import { TrendingMediaSection } from '@/components/trending/TrendingMediaSection';
import { FC } from 'react';
import { getTrendingShows, TrendingShow } from '@/features/show';

export const TrendingShowList: FC = async () => {
  const trendingShows = await getTrendingShows();

  return (
    <TrendingMediaSection<TrendingShow>
      icon={IconDeviceTv}
      title="Trending TV Series"
      trendingMedia={trendingShows}
      subtitle="Most watched and talked-about TV shows right now. Track them directly to your library."
    />
  );
};
