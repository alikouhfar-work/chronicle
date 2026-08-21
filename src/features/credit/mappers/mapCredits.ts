import { SearchResultRaw } from '@/features/search';
import { SearchResult } from '@/features/search/types/searchResult';
import { mapShowSearchResult } from '@/features/show/mappers/mapShowSearchResult';
import { mapMovieSearchResult } from '@/features/movie/mappers/mapMovieSearchResult';

export const mapSearchResult = (
  searchResults: SearchResultRaw[],
  genreDictionary: Map<number, string>,
): SearchResult[] =>
  searchResults
    .filter((result) => result.media_type === 'tv' || result.media_type === 'movie')
    .map((result) => {
      if (result.media_type === 'tv') {
        return mapShowSearchResult(result, genreDictionary);
      }
      return mapMovieSearchResult(result, genreDictionary);
    });
