import { unstable_cache } from 'next/cache';
import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import type { TmdbListItemRaw } from '@/modules/media/types/tmdbRaw';
import type { PaginatedResponse } from '@/modules/media/types/paginatedResponse';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import { MEDIA_TAG } from '@/shared/lib/cacheTags';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';

const SIMILAR_REVALIDATE_SECONDS = 604800;

const readSimilar = async (
  mediaType: MediaType,
  tmdbId: number,
): Promise<TmdbListItemRaw[]> => {
  const response = await tmdbFetch<PaginatedResponse<TmdbListItemRaw>>(
    `${toTmdbKind(mediaType)}/${tmdbId}/similar`,
    { next: { revalidate: SIMILAR_REVALIDATE_SECONDS } },
  );
  return response.results;
};

/**
 * Similar titles depend only on the title, not the viewer, so the list is
 * cached per (type, id). The tracked flags layered on top by the caller stay
 * per-user and uncached.
 */
const cachedSimilar = unstable_cache(readSimilar, ['tmdb-similar'], {
  tags: [MEDIA_TAG],
  revalidate: SIMILAR_REVALIDATE_SECONDS,
});

/** Similar titles for a media type, raw and un-mapped. */
export const fetchSimilarRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
  id: string,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const tmdbId = parseTmdbId(id);
  const [results, genreDictionary] = await Promise.all([
    (async () => {
      try {
        return (await cachedSimilar(mediaType, tmdbId)) as T[];
      } catch {
        return (await readSimilar(mediaType, tmdbId)) as T[];
      }
    })(),
    getGenreDictionary(),
  ]);

  return { results, genreDictionary };
};
