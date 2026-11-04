import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { mapCredits } from '@/modules/discovery/credit/mappers/mapCredits';
import type { Credits, CreditsRaw } from '@/modules/discovery/credit';
import { toTmdbKind } from '@/modules/media/queries/tmdbKind';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';

const CREDITS_REVALIDATE_SECONDS = 604800;

/** Cast and crew for a title, mapped into the app's credit shape. */
export const fetchCredits = async (mediaType: MediaType, id: string): Promise<Credits> => {
  const tmdbId = parseTmdbId(id);
  const credits = await tmdbFetch<CreditsRaw>(`${toTmdbKind(mediaType)}/${tmdbId}/credits`, {
    next: { revalidate: CREDITS_REVALIDATE_SECONDS },
  });

  return mapCredits(credits);
};
