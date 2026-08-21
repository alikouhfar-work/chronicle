import { AddMediaParams } from '@/features/library/types/addMedia';
import { addShow } from '@/features/library/services/addShow';
import { addMovie } from '@/features/library/services/addMovie';

export const addMedia = async ({ tmdbId, mediaType }: AddMediaParams) => {
  switch (mediaType) {
    case 'tv':
      return addShow(tmdbId);

    case 'movie':
      return addMovie(tmdbId);

    default:
      throw new Error('Unsupported media type');
  }
};
