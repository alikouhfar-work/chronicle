import { ShowSearchResultRaw } from '@/features/show';
import { MovieSearchResult, MovieSearchResultRaw } from '@/features/movie';
import { ShowSearchResult } from '@/features/show/types/showSearchResult';

export type SearchResultRaw = ShowSearchResultRaw | MovieSearchResultRaw;
export type SearchResult =
  Omit<ShowSearchResult, 'isTracked'> | Omit<MovieSearchResult, 'isTracked'>;

export type SearchResultResponse = {
  results: ShowSearchResultRaw[] | MovieSearchResultRaw[];
};
