import { AddMediaParams } from '@/modules/library/types/addMedia';
import { addShow } from '@/modules/show/actions/addShow';
import { addMovie } from '@/modules/movie/actions/addMovie';
import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { ValidationError } from '@/shared/lib/errors';

export const addMedia = async ({ tmdbId, mediaType, trackingStatus }: AddMediaParams) => {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new ValidationError(`tmdbId must be a positive integer, got "${tmdbId}"`);
  }

  switch (mediaType) {
    case 'tv':
      if (
        trackingStatus !== undefined &&
        !Object.values(ShowTrackingStatus).includes(trackingStatus)
      ) {
        throw new ValidationError(`Invalid show tracking status: ${trackingStatus}`);
      }
      return addShow(tmdbId, trackingStatus);

    case 'movie':
      if (
        trackingStatus !== undefined &&
        !Object.values(MovieTrackingStatus).includes(trackingStatus)
      ) {
        throw new ValidationError(`Invalid movie tracking status: ${trackingStatus}`);
      }
      return addMovie(tmdbId, trackingStatus);

    default:
      throw new ValidationError(`Unsupported media type: ${mediaType}`);
  }
};
