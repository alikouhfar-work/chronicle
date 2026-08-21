import { TrackedMovie } from '@/features/movie';
import { TrackedShow } from '@/features/show';
import { WatchStats } from '@/app/(main)/(dashboard)/_types/watchStats';

export const useWatchStats = (shows: TrackedShow[], movies: TrackedMovie[]): WatchStats => {
  let totalShowMinutes = 0;
  let totalMovieMinutes = 0;

  let episodesCount = 0;
  let moviesCount = 0;

  let activeShowsCount = 0;
  let completedShowsCount = 0;
  let completedMoviesCount = 0;

  for (const show of shows) {
    switch (show.tracking?.status) {
      case 'WATCHING':
        activeShowsCount++;
        break;

      case 'COMPLETED':
        completedShowsCount++;
        break;
    }

    for (const season of show.seasons) {
      if (season.seasonNumber === 0) continue;

      for (const episode of season.episodes) {
        if (!episode.tracking?.watched) continue;

        episodesCount++;
        totalShowMinutes += episode.runtime ?? 0;
      }
    }
  }

  for (const movie of movies) {
    if (movie.tracking?.status !== 'COMPLETED') continue;

    completedMoviesCount++;
    moviesCount++;
    totalMovieMinutes += movie.runtime ?? 120;
  }

  const totalCompletedCount = completedShowsCount + completedMoviesCount;
  const totalLibraryCount = shows.length + movies.length;

  return {
    totalShowMinutes,
    totalMovieMinutes,
    episodesCount,
    moviesCount,
    activeShowsCount,
    completedShowsCount,
    completedMoviesCount,
    totalCompletedCount,
    totalLibraryCount,
    completionRatePercent:
      totalLibraryCount === 0 ? 0 : Math.round((totalCompletedCount / totalLibraryCount) * 100),
  };
};
