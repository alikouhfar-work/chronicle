import { AddMediaParams } from '@/features/library/types/addMedia';
import { addShow } from '@/features/show/actions/addShow';
import { addMovie } from '@/features/movie/actions/addMovie';

export const addMedia = async ({ tmdbId, mediaType, trackingStatus }: AddMediaParams) => {
  switch (mediaType) {
    case 'tv':
      return addShow(tmdbId, trackingStatus);

    case 'movie':
      return addMovie(tmdbId, trackingStatus);

    default:
      throw new Error('Unsupported media type');
  }
};
