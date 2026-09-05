import { MappedUpcomingMovie, UpcomingMovie } from '@/features/movie/types/upcomingMovie';

export const mapUpcomingMovies = (movies: UpcomingMovie[]): MappedUpcomingMovie[] =>
  movies.map((movie) => ({
    id: movie.id,
    name: movie.name,
    tmdbId: movie.tmdbId,
    overview: movie.overview,
    airDate: movie.releaseDate,
    posterPath: movie.posterPath,
  }));
