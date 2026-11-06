import { unstable_cache } from 'next/cache';
import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import type { TmdbListItemRaw } from '@/modules/media/types/tmdbRaw';
import type { PaginatedResponse } from '@/modules/media/types/paginatedResponse';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import { TRENDING_TAG } from '@/shared/lib/cacheTags';
import type { MediaType } from '@/shared/types/media';

const TRENDING_REVALIDATE_SECONDS = 86400;

const readTrending = async (mediaType: MediaType): Promise<TmdbListItemRaw[]> => {
  const response = await tmdbFetch<PaginatedResponse<TmdbListItemRaw>>(
    `trending/${toTmdbKind(mediaType)}/week`,
    { next: { revalidate: TRENDING_REVALIDATE_SECONDS } },
  );
  return response.results;
};

/**
 * Trending is shared by every visitor, so the list is cached whole. The cast at
 * the call site is safe: the cache stores exactly what TMDB returned for that
 * media type, and the caller picks the list-item shape it asked for.
 */
const cachedTrending = unstable_cache(readTrending, ['tmdb-trending'], {
  tags: [TRENDING_TAG],
  revalidate: TRENDING_REVALIDATE_SECONDS,
});

/** Weekly trending titles for a media type, raw and un-mapped. */
export const fetchTrendingRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const [results, genreDictionary] = await Promise.all([
    (async () => {
      try {
        return (await cachedTrending(mediaType)) as T[];
      } catch {
        return (await readTrending(mediaType)) as T[];
      }
    })(),
    getGenreDictionary(),
  ]);

  return { results, genreDictionary };
};
