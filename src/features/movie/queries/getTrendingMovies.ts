import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { mapTrendingMovies, TrendingMovie } from '@/features/movie';
import { GetTrendingMoviesResponse } from '@/features/movie/types/getTrendingMovies';
import { getTrackedMoviesLookup } from '@/features/movie/queries/getTrackedMoviesLookup';

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const [trendingMovies, genreDictionary] = await Promise.all([
      tmdbFetch<GetTrendingMoviesResponse>('trending/movie/week', {
        next: {
          revalidate: 86400,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapTrendingMovies(trendingMovies.results, genreDictionary);

    const movieTmdbIds = results.map((result) => result.id);

    const trackedMoviesLookup = await getTrackedMoviesLookup(movieTmdbIds);

    return results.map((show) => ({
      ...show,
      isTracked: trackedMoviesLookup.has(show.id),
    }));
  } catch (error) {
    console.error('Failed to fetch trending movies:', error);
    return [];
  }
};
