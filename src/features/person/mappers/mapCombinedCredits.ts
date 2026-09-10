import { CombinedCredit, CombinedCreditRaw } from '@/features/person/types/combinedCredit';
import { mapCreditShows } from '@/features/person/mappers/mapCreditShows';
import { mapCreditMovies } from '@/features/person/mappers/mapCreditMovies';

export const mapCombinedCredits = (
  combinedCredits: CombinedCreditRaw[],
  genreDictionary: Map<number, string>,
): Omit<CombinedCredit, 'isTracked'>[] =>
  combinedCredits
    .filter((result) => result.media_type === 'tv' || result.media_type === 'movie')
    .map((combinedCredit) => {
      if (combinedCredit.media_type === 'tv') {
        return mapCreditShows(combinedCredit, genreDictionary);
      }
      return mapCreditMovies(combinedCredit, genreDictionary);
    });
