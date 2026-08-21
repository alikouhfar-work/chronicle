import { TrendingMovie, TrendingMovieRaw } from '@/features/movie';

export const mapTrendingMovies = (
  trendingMovies: TrendingMovieRaw[],
  genreDictionary: Map<number, string>,
): Omit<TrendingMovie, 'isTracked'>[] =>
  trendingMovies.map((trendingMovie) => ({
    backdropPath: trendingMovie.backdrop_path,
    id: trendingMovie.id,
    name: trendingMovie.title,
    overview: trendingMovie.overview,
    mediaType: trendingMovie.media_type,
    releaseDate: trendingMovie.release_date,
    rating: trendingMovie.vote_average,
    voteCount: trendingMovie.vote_count,
    genres: trendingMovie.genre_ids
      .map((id) => {
        const name = genreDictionary.get(id);
        return name ? { id, name } : null;
      })
      .filter((genre): genre is { id: number; name: string } => genre !== null),
  }));
