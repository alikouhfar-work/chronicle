import type { ShowSearchResultRaw } from '@/modules/show';
import type { MovieSearchResult, MovieSearchResultRaw } from '@/modules/movie';
import type { ShowSearchResult } from '@/modules/show/types/showSearchResult';

export type SearchResultRaw = ShowSearchResultRaw | MovieSearchResultRaw;
export type SearchResult =
  Omit<ShowSearchResult, 'isTracked'> | Omit<MovieSearchResult, 'isTracked'>;

export type SearchResponse = {
  results: ShowSearchResultRaw[] | MovieSearchResultRaw[];
};

export type SearchPreview = {
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  name: string;
  overview: string | null;
  posterPath: string | null;
};
