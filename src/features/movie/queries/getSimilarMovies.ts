import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { getTrackedShowsLookup } from '@/features/show';
import { SimilarMovie } from '@/features/movie/types/similarMovie';
import { mapSimilarMovies } from '@/features/movie/mappers/mapSimilarMovies';
import { GetSimilarMoviesResponse } from '@/features/movie/types/getSimilarMovies';

export const getSimilarMovies = async (id: string): Promise<SimilarMovie[]> => {
  try {
    const [similarShows, genreDictionary] = await Promise.all([
      tmdbFetch<GetSimilarMoviesResponse>(`movie/${id}/similar`, {
        next: {
          revalidate: 86400,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapSimilarMovies(similarShows.results, genreDictionary);

    const showTmdbIds = results.map((result) => result.id);

    const trackedShowsLookup = await getTrackedShowsLookup(showTmdbIds);

    return results.map((show) => ({
      ...show,
      isTracked: trackedShowsLookup.has(show.id),
    }));
  } catch (error) {
    console.error('Failed to fetch similar movies:', error);
    return [];
  }
};
