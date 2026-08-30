import { IconDeviceTv } from '@tabler/icons-react';
import { TrendingMediaSection } from '@/components/trending/TrendingMediaSection';
import { FC } from 'react';
import { getTrendingShows, TrendingShow } from '@/features/show';

export const TrendingShowList: FC = async () => {
  const trendingShows = await getTrendingShows();

  return (
    <TrendingMediaSection<TrendingShow>
      icon={IconDeviceTv}
      title="Trending TV Shows"
      trendingMedia={trendingShows}
      subtitle="Popular series everyone is watching right now."
    />
  );
};
