import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import type { TmdbListItemRaw } from '@/modules/media/types/tmdbRaw';
import type { PaginatedResponse } from '@/modules/media/types/paginatedResponse';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import type { MediaType } from '@/shared/types/media';

const TRENDING_REVALIDATE_SECONDS = 86400;

/** Weekly trending titles for a media type, raw and un-mapped. */
export const fetchTrendingRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const [response, genreDictionary] = await Promise.all([
    tmdbFetch<PaginatedResponse<T>>(`trending/${toTmdbKind(mediaType)}/week`, {
      next: { revalidate: TRENDING_REVALIDATE_SECONDS },
    }),
    getGenreDictionary(),
  ]);

  return { results: response.results, genreDictionary };
};
