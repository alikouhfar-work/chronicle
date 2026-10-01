import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type AddMediaParams =
  | {
      tmdbId: number;
      mediaType: 'tv';
      trackingStatus?: ShowTrackingStatus;
    }
  | {
      tmdbId: number;
      mediaType: 'movie';
      trackingStatus?: MovieTrackingStatus;
    };

export type AddMediaActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };
