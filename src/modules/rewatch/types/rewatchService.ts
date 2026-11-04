import type { Prisma } from '../../../../generated/prisma/client';
import type { RewatchMediaType as DbRewatchMediaType } from '../../../../generated/prisma/enums';

export type CreateRewatchLogData = {
  userId: string;
  mediaType: DbRewatchMediaType;
  mediaId: string;
  rewatchedAt: Date;
  showId?: string;
  seasonId?: string;
  episodeId?: string;
  movieId?: string;
};

export type MediaRef = {
  tmdbId: number;
  rewatchCount: number;
};

export type RewatchDbClient = Pick<
  Prisma.TransactionClient,
  'show' | 'movie' | 'season' | 'episode' | 'rewatchLog' | 'episodeTracking'
>;
