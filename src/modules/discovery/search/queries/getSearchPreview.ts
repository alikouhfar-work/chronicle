import { tmdbFetch } from '@/infra/tmdb/client';
import type {
  SearchResultRaw,
  SearchResultResponse,
} from '@/modules/discovery/search/types/searchResult';

export type SearchPreview = {
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  name: string;
  overview: string | null;
  posterPath: string | null;
};

const MAX_QUERY_LENGTH = 200;

/**
 * Auth-free TMDB lookup used to build Open Graph metadata for shared search
 * links. Telegram (and other crawlers) arrive without a session, so this must
 * never touch user-scoped queries.
 */
export const getSearchPreview = async (query: string): Promise<SearchPreview | null> => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > MAX_QUERY_LENGTH) return null;

  try {
    const response = await tmdbFetch<SearchResultResponse>(
      `/search/multi?query=${encodeURIComponent(trimmed)}`,
      { next: { revalidate: 300 } },
    );

    // The API types model movie/tv arrays as a union; normalize for filtering.
    const results = response.results as SearchResultRaw[];
    const candidates = results.filter(
      (result) => result.media_type === 'tv' || result.media_type === 'movie',
    );
    const match = candidates.find((result) => Boolean(result.poster_path)) ?? candidates[0];
    if (!match) return null;

    return {
      mediaType: match.media_type,
      tmdbId: match.id,
      name: match.media_type === 'tv' ? match.name : match.title,
      overview: match.overview || null,
      posterPath: match.poster_path || null,
    };
  } catch {
    return null;
  }
};
