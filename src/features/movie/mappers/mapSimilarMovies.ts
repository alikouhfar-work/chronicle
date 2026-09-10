import { SimilarMovie, SimilarMovieRaw } from '@/features/movie/types/similarMovie';

export const mapSimilarMovies = (
  similarMovies: SimilarMovieRaw[],
  genreDictionary: Map<number, string>,
): Omit<SimilarMovie, 'isTracked'>[] =>
  similarMovies.map((similarMovie) => ({
    backdropPath: similarMovie.backdrop_path,
    mediaType: 'tv',
    id: similarMovie.id,
    name: similarMovie.title,
    overview: similarMovie.overview,
    releaseDate: similarMovie.release_date,
    genres: similarMovie.genre_ids
      .map((id) => {
        const name = genreDictionary.get(id);
        return name ? { id, name } : null;
      })
      .filter((genre): genre is { id: number; name: string } => genre !== null),
  }));
