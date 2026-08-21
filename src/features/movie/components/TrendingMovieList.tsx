import { IconDeviceTv } from '@tabler/icons-react';
import { TrendingMediaList } from '@/components/trending/TrendingMediaList';
import { FC } from 'react';
import { TrendingShowListProps } from '@/features/show/types/trending';

export const TrendingShowList: FC<TrendingShowListProps> = ({ trendingShows }) => {
  return (
    <TrendingMediaList
      icon={IconDeviceTv}
      title="Trending TV Series"
      trendingMedia={trendingShows}
      subtitle="Most watched and talked-about TV shows right now. Track them directly to your library."
    />
  );
};
