import { revalidatePath, revalidateTag } from 'next/cache';
import type { MediaType } from '@/shared/types/media';
import { MEDIA_TAG } from '@/shared/lib/cacheTags';

/**
 * Invalidation for writes.
 *
 * Pages stay dynamic because they carry user-owned rows, but the TMDB fragments
 * inside them are cached by tag. Both forms are invalidated:
 * - the tag clears the fragment caches (credits, similar titles, genres),
 * - the page *pattern* covers the catch-all route — a concrete path under
 *   `library/[...slug]` does not match it and silently stops invalidating,
 * - the concrete path still refreshes the router entry for the page the user is
 *   looking at.
 */
const revalidateSafely = (invalidate: () => void): void => {
  try {
    invalidate();
  } catch {
    // Next throws without a cache store (unit tests, scripts). Invalidation is
    // an optimization; a failed call must never fail the write.
  }
};

export const revalidateLibrary = (): void => {
  revalidateSafely(() => {
    revalidatePath('/', 'page');
    revalidatePath('/library', 'page');
  });
};

export const revalidateMediaDetail = (mediaType: MediaType, tmdbId: number): void => {
  revalidateSafely(() => revalidateTag(MEDIA_TAG, 'max'));
  revalidateSafely(() => revalidatePath('/library/[...slug]', 'page'));
  revalidateSafely(() => revalidatePath(`/library/${mediaType}/${tmdbId}`, 'page'));
  revalidateLibrary();
};
