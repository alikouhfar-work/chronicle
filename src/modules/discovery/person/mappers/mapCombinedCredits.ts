import { CombinedCredit, CombinedCreditRaw } from '@/modules/discovery/person/types/combinedCredit';
import { mapCreditShows } from '@/modules/discovery/person/mappers/mapCreditShows';
import { mapCreditMovies } from '@/modules/discovery/person/mappers/mapCreditMovies';

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
