import { MappedUpcomingMovie, UpcomingMovie } from '@/features/movie/types/upcomingMovie';

export const mapUpcomingMovies = (movies: UpcomingMovie[]): MappedUpcomingMovie[] =>
  movies.map((movie) => ({
    id: movie.id,
    name: movie.name,
    overview: movie.overview,
    mediaTmdbId: movie.tmdbId,
    airDate: movie.releaseDate,
    posterPath: movie.posterPath,
  }));
