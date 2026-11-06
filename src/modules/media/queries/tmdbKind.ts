import type { MediaType } from '@/shared/types/media';

/** TMDB path segment for a media type ('tv' is TMDB's name for shows). */
export const toTmdbKind = (mediaType: MediaType): 'movie' | 'tv' =>
  mediaType === 'movie' ? 'movie' : 'tv';
