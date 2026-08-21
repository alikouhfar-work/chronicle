import { IconMovie } from '@tabler/icons-react';
import { TrendingMediaSection } from '@/components/trending/TrendingMediaSection';
import { FC } from 'react';
import { getTrendingMovies, TrendingMovie } from '@/features/movie';

export const TrendingMovieList: FC = async () => {
  const trendingMovies = await getTrendingMovies();

  return (
    <TrendingMediaSection<TrendingMovie>
      icon={IconMovie}
      trendingMedia={trendingMovies}
      title="Trending Blockbuster Movies"
      subtitle="Critically acclaimed feature films and hot theatrical releases."
    />
  );
};
