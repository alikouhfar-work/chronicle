import { AddMediaParams } from '@/features/library/types/addMedia';
import { addShow } from '@/features/show';
import { addMovie } from '@/features/movie';

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
