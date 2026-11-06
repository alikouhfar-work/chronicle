import type { CommentMediaType } from '@/modules/comments/types';

/** Prisma stores the enum name ("SHOW"); older rows used the mapped label. */
export const toAppMediaType = (value: string): CommentMediaType => {
  const normalized = typeof value === 'string' ? value.toUpperCase() : '';
  if (normalized === 'SHOW') return 'show';
  if (normalized === 'EPISODE') return 'episode';
  return 'movie';
};

const reviewsTab = (commentAvailable: boolean, commentId: string): string =>
  commentAvailable
    ? `?tab=reviews#comment-${commentId}`
    : '?tab=reviews&mention=unavailable';

export const buildMovieNotificationHref = (
  tmdbId: number,
  commentId: string,
  commentAvailable: boolean,
): string => `/library/movie/${tmdbId}${reviewsTab(commentAvailable, commentId)}`;

// Library detail routes are `/library/tv/[tmdbId]` — `/library/show/...` 404s.
export const buildShowNotificationHref = (
  tmdbId: number,
  commentId: string,
  commentAvailable: boolean,
): string => `/library/tv/${tmdbId}${reviewsTab(commentAvailable, commentId)}`;

/**
 * The episode page is keyed by the internal episode id, which only exists in
 * libraries that track the episode. When the recipient's copy (or every copy)
 * is gone, fall back to the parent show page. A deleted comment degrades to the
 * media page with a notice instead of a comment anchor.
 */
export const buildEpisodeNotificationHref = (
  showTmdbId: number | null,
  episodeDbId: string | null,
  commentId: string,
  commentAvailable: boolean,
): string => {
  if (showTmdbId !== null && episodeDbId !== null && commentAvailable) {
    return `/library/tv/${showTmdbId}/episode/${episodeDbId}?tab=reviews#comment-${commentId}`;
  }
  if (showTmdbId !== null) {
    return `/library/tv/${showTmdbId}?tab=reviews&mention=unavailable`;
  }
  return '/library?mention=unavailable';
};
