import { mapSimilar as mapSimilarBase } from '@/modules/media/mappers';
import type { SimilarShow, SimilarShowRaw } from '@/modules/show/types/similarShow';

export const mapSimilarShows = (
  similarShows: SimilarShowRaw[],
  genreDictionary: Map<number, string>,
): Omit<SimilarShow, 'isTracked'>[] =>
  mapSimilarBase(similarShows, genreDictionary, 'tv') as Omit<SimilarShow, 'isTracked'>[];
