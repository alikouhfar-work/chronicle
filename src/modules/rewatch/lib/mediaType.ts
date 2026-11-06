import { RewatchMediaType as DbRewatchMediaType } from '../../../../generated/prisma/enums';
import type { RewatchMediaType } from '@/modules/rewatch/types/rewatch';
import { ValidationError } from '@/shared/lib/errors';

const REWATCH_MEDIA_TYPES: readonly RewatchMediaType[] = ['episode', 'season', 'show', 'movie'];

export const parseRewatchMediaType = (value: unknown): RewatchMediaType => {
  if (typeof value !== 'string') {
    throw new ValidationError('mediaType must be one of: episode, season, show, movie');
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'tv') return 'show';
  if (REWATCH_MEDIA_TYPES.includes(normalized as RewatchMediaType)) {
    return normalized as RewatchMediaType;
  }

  throw new ValidationError(`Invalid mediaType "${value}"`);
};

export const toDbRewatchMediaType = (
  mediaType: RewatchMediaType,
): DbRewatchMediaType => {
  switch (mediaType) {
    case 'episode':
      return DbRewatchMediaType.EPISODE;
    case 'season':
      return DbRewatchMediaType.SEASON;
    case 'show':
      return DbRewatchMediaType.SHOW;
    case 'movie':
      return DbRewatchMediaType.MOVIE;
  }
};

