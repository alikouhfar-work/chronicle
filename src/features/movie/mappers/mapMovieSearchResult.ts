import { MovieSearchResult, MovieSearchResultRaw } from '@/features/movie';

export const mapMovieSearchResult = (
  movie: MovieSearchResultRaw,
  genreDictionary: Map<number, string>,
): Omit<MovieSearchResult, 'isTracked'> => ({
  adult: movie.adult,
  backdropPath: movie.backdrop_path,
  id: movie.id,
  name: movie.title,
  overview: movie.overview,
  posterPath: movie.poster_path,
  mediaType: movie.media_type,
  releaseDate: movie.release_date,
  voteAverage: movie.vote_average,
  originalLanguage: movie.original_language,
  genres: movie.genre_ids
    .map((id) => {
      const name = genreDictionary.get(id);
      return name ? { id, name } : null;
    })
    .filter((genre): genre is { id: number; name: string } => genre !== null),
});
