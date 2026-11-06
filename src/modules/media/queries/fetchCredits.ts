import { unstable_cache } from 'next/cache';
import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { mapCredits } from '@/modules/discovery/credit/mappers/mapCredits';
import type { Credits, CreditsRaw } from '@/modules/discovery/credit';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import { MEDIA_TAG } from '@/shared/lib/cacheTags';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';

const CREDITS_REVALIDATE_SECONDS = 604800;

const readCredits = async (mediaType: MediaType, tmdbId: number): Promise<Credits> => {
  const credits = await tmdbFetch<CreditsRaw>(`${toTmdbKind(mediaType)}/${tmdbId}/credits`, {
    next: { revalidate: CREDITS_REVALIDATE_SECONDS },
  });

  return mapCredits(credits);
};

/**
 * Cast and crew are the same for every visitor, and the mapping is the expensive
 * part of the page (two lists of hundreds of people). Cached per title.
 */
const cachedCredits = unstable_cache(readCredits, ['tmdb-credits'], {
  tags: [MEDIA_TAG],
  revalidate: CREDITS_REVALIDATE_SECONDS,
});

/** Cast and crew for a title, mapped into the app's credit shape. */
export const fetchCredits = async (mediaType: MediaType, id: string): Promise<Credits> => {
  const tmdbId = parseTmdbId(id);

  try {
    return await cachedCredits(mediaType, tmdbId);
  } catch {
    return readCredits(mediaType, tmdbId);
  }
};
