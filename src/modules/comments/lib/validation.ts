import type { CommentMediaType } from '@/modules/comments/types';

const MEDIA_TYPES: CommentMediaType[] = ['movie', 'show', 'episode'];

export const isCommentMediaType = (value: unknown): value is CommentMediaType =>
  typeof value === 'string' && MEDIA_TYPES.includes(value as CommentMediaType);

/** Public comments are always keyed by a positive TMDB id. */
export const isTmdbId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

export const PRISMA_MEDIA_TYPE: Record<CommentMediaType, 'MOVIE' | 'SHOW' | 'EPISODE'> = {
  movie: 'MOVIE',
  show: 'SHOW',
  episode: 'EPISODE',
};

/** Inverse of PRISMA_MEDIA_TYPE: database enum name -> app-level media type. */
export const APP_MEDIA_TYPE: Record<'MOVIE' | 'SHOW' | 'EPISODE', CommentMediaType> = {
  MOVIE: 'movie',
  SHOW: 'show',
  EPISODE: 'episode',
};
