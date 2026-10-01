import { ShowSearchResultRaw } from '@/modules/show';
import { MovieSearchResult, MovieSearchResultRaw } from '@/modules/movie';
import { ShowSearchResult } from '@/modules/show/types/showSearchResult';

export type SearchResultRaw = ShowSearchResultRaw | MovieSearchResultRaw;
export type SearchResult =
  Omit<ShowSearchResult, 'isTracked'> | Omit<MovieSearchResult, 'isTracked'>;

export type SearchResultResponse = {
  results: ShowSearchResultRaw[] | MovieSearchResultRaw[];
};
