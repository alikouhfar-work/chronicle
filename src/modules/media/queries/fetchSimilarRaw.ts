import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import type { TmdbListItemRaw } from '@/modules/media/types/tmdbRaw';
import type { PaginatedResponse } from '@/modules/media/types/paginatedResponse';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';

const SIMILAR_REVALIDATE_SECONDS = 604800;

/** Similar titles for a media type, raw and un-mapped. */
export const fetchSimilarRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
  id: string,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const tmdbId = parseTmdbId(id);
  const [response, genreDictionary] = await Promise.all([
    tmdbFetch<PaginatedResponse<T>>(`${toTmdbKind(mediaType)}/${tmdbId}/similar`, {
      next: { revalidate: SIMILAR_REVALIDATE_SECONDS },
    }),
    getGenreDictionary(),
  ]);

  return { results: response.results, genreDictionary };
};
