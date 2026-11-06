/**
 * Cache tags for the fragments that are not user-owned.
 *
 * A TMDB-derived section (trending, similar titles, credits) is identical for
 * every visitor, so it is cached and invalidated by tag. User-owned reads are
 * never cached and never carry a tag.
 */
export const GENRES_TAG = 'genres';

/**
 * Every TMDB-derived fragment of a title (credits, similar titles).
 *
 * `unstable_cache` takes its tags when the wrapper is created, so a tag per
 * (type, id) would need one wrapper per title. One coarse tag gives the same
 * invalidation guarantee for a catalog this size: a correction to any title
 * clears the fragments and they are rebuilt on next view.
 */
export const MEDIA_TAG = 'media';

/** Every trending rail. */
export const TRENDING_TAG = 'trending';
