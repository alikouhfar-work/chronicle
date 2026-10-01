import { mapSimilar as mapSimilarBase } from '@/modules/media/mappers';
import type { SimilarMovie, SimilarMovieRaw } from '@/modules/movie/types/similarMovie';

export const mapSimilarMovies = (
  similarMovies: SimilarMovieRaw[],
  genreDictionary: Map<number, string>,
): Omit<SimilarMovie, 'isTracked'>[] =>
  mapSimilarBase(similarMovies, genreDictionary, 'movie') as Omit<SimilarMovie, 'isTracked'>[];
