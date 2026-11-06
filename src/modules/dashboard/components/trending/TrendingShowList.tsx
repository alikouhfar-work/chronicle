import { IconDeviceTv } from '@tabler/icons-react';
import { TrendingMediaSection } from '@/modules/dashboard/components/trending/TrendingMediaSection';
import type { TrendingShow } from '@/modules/show';
import { getTrendingShows } from '@/modules/show/queries/getTrendingShows';

export const TrendingShowList = async () => {
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
