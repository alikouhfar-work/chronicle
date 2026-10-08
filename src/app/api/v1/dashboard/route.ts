import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { getTrackedShows } from '@/modules/show/queries/getTrackedShows';
import { getTrackedMovies } from '@/modules/movie/queries/getTrackedMovies';
import { getUpNextEpisodes } from '@/modules/episode-season/queries/getUpNextEpisodes';
import { getUpcomingEpisodes } from '@/modules/episode-season/queries/getUpcomingEpisodes';
import { getUpcomingMovies } from '@/modules/movie/queries/getUpcomingMovies';
import { getTrendingShows } from '@/modules/show/queries/getTrendingShows';
import { getTrendingMovies } from '@/modules/movie/queries/getTrendingMovies';

export const GET = async () => {
  try {
    await requireApiUserId();
    const [shows, movies, upNext, upcomingEpisodes, upcomingMovies, trendingShows, trendingMovies] =
      await Promise.all([
        getTrackedShows(),
        getTrackedMovies(),
        getUpNextEpisodes(),
        getUpcomingEpisodes(),
        getUpcomingMovies(),
        getTrendingShows(),
        getTrendingMovies(),
      ]);
    return apiOk({
      shows,
      movies,
      upNext,
      upcomingEpisodes,
      upcomingMovies,
      trendingShows,
      trendingMovies,
    });
  } catch (error) {
    return apiError(error);
  }
};
