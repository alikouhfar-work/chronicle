import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { parseTmdbId } from '@/shared/lib/validate';
import type { MediaType } from '@/shared/types/media';
import type { TrackedMovieDetailsRaw } from '@/modules/movie/types/trackedMovie';
import type { ShowDetailsRaw } from '@/modules/show/types/showDetails';
import { mapTitleDetails } from '../mappers/mapTitleDetails';
import type { TitleDetails } from '../types/titleDetails';

const DETAILS_REVALIDATE_SECONDS = 86400;

export const getTitleDetails = async (
  mediaType: MediaType,
  id: string,
): Promise<TitleDetails | null> => {
  try {
    const tmdbId = parseTmdbId(id);
    const kind = mediaType === 'movie' ? 'movie' : 'tv';
    const raw = await tmdbFetch<TrackedMovieDetailsRaw | ShowDetailsRaw>(
      `${kind}/${tmdbId}`,
      {
        next: { revalidate: DETAILS_REVALIDATE_SECONDS },
      },
    );

    return mapTitleDetails(mediaType, raw);
  } catch {
    return null;
  }
};
