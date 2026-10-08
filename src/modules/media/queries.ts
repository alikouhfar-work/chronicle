import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import { mapCredits } from '@/modules/discovery/credit/mappers/mapCredits';
import type { Credits, CreditsRaw } from '@/modules/discovery/credit';
import type { TmdbListItemRaw } from '@/modules/media/tmdb';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';

type PaginatedResponse<T> = {
  results: T[];
};

const TRENDING_REVALIDATE_SECONDS = 86400;
const SIMILAR_REVALIDATE_SECONDS = 604800;
const CREDITS_REVALIDATE_SECONDS = 604800;

const tmdbKind = (mediaType: MediaType): 'movie' | 'tv' =>
  mediaType === 'movie' ? 'movie' : 'tv';

export const fetchTrendingRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const [response, genreDictionary] = await Promise.all([
    tmdbFetch<PaginatedResponse<T>>(`trending/${tmdbKind(mediaType)}/week`, {
      next: { revalidate: TRENDING_REVALIDATE_SECONDS },
    }),
    getGenreDictionary(),
  ]);

  return { results: response.results, genreDictionary };
};

export const fetchSimilarRaw = async <T extends TmdbListItemRaw>(
  mediaType: MediaType,
  id: string,
): Promise<{ results: T[]; genreDictionary: Map<number, string> }> => {
  const tmdbId = parseTmdbId(id);
  const [response, genreDictionary] = await Promise.all([
    tmdbFetch<PaginatedResponse<T>>(`${tmdbKind(mediaType)}/${tmdbId}/similar`, {
      next: { revalidate: SIMILAR_REVALIDATE_SECONDS },
    }),
    getGenreDictionary(),
  ]);

  return { results: response.results, genreDictionary };
};

export const fetchCredits = async (mediaType: MediaType, id: string): Promise<Credits> => {
  const tmdbId = parseTmdbId(id);
  const credits = await tmdbFetch<CreditsRaw>(`${tmdbKind(mediaType)}/${tmdbId}/credits`, {
    next: { revalidate: CREDITS_REVALIDATE_SECONDS },
  });

  return mapCredits(credits);
};

export const withTrackedFlags = async <R extends { id: number }>(
  items: Omit<R, 'isTracked'>[],
  getLookup: (tmdbIds: number[]) => Promise<Set<number>>,
): Promise<(Omit<R, 'isTracked'> & { isTracked: boolean })[]> => {
  const tracked = await getLookup(items.map((item) => item.id));

  return items.map((item) => ({
    ...item,
    isTracked: tracked.has(item.id),
  }));
};
