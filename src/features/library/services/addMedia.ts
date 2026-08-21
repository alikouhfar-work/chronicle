import { ImportMediaParams } from '@/features/library/types/importMedia';
import { importShow } from '@/features/library/services/importShow';

export const importMedia = async ({ tmdbId, mediaType }: ImportMediaParams) => {
  switch (mediaType) {
    case 'tv':
      return importShow(tmdbId);

    // case 'movie':
    //   return importMovie(tmdbId);

    default:
      throw new Error('Unsupported media type');
  }
};
