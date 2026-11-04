/**
 * Decorates mapped TMDB items with the viewer's tracking state, resolved in a
 * single batched lookup.
 */
export const attachTrackedFlags = async <R extends { id: number }>(
  items: Omit<R, 'isTracked'>[],
  getLookup: (tmdbIds: number[]) => Promise<Set<number>>,
): Promise<(Omit<R, 'isTracked'> & { isTracked: boolean })[]> => {
  const tracked = await getLookup(items.map((item) => item.id));

  return items.map((item) => ({
    ...item,
    isTracked: tracked.has(item.id),
  }));
};
