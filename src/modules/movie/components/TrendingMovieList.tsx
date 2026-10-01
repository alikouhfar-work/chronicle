import { IconMovie } from '@tabler/icons-react';
import { TrendingMediaSection } from '@/shared/ui/trending/TrendingMediaSection';
import { TrendingMovie } from '@/modules/movie';
import { getTrendingMovies } from '@/modules/movie/queries/getTrendingMovies';

export const TrendingMovieList = async () => {
  const trendingMovies = await getTrendingMovies();

  return (
    <TrendingMediaSection<TrendingMovie>
      icon={IconMovie}
      trendingMedia={trendingMovies}
      title="Trending Movies"
      subtitle="Blockbusters and celebrated films making waves."
    />
  );
};
