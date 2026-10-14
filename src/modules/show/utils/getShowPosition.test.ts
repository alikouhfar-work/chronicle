import { describe, expect, it } from 'vitest';
import { getShowPosition } from './getShowPosition';

const ep = (episodeNumber: number, watched: boolean) =>
  ({ episodeNumber, tracking: watched ? { watched: true } : null }) as never;

const season = (seasonNumber: number, watched: boolean[]) =>
  ({
    seasonNumber,
    episodes: watched.map((w, i) => ep(i + 1, w)),
  }) as never;

describe('getShowPosition', () => {
  it('points at the first unwatched episode across seasons', () => {
    const { nextLabel, segments } = getShowPosition([
      season(1, [true, true]),
      season(2, [true, false]),
    ]);

    expect(nextLabel).toBe('S2 E2');
    expect(segments).toEqual([
      { seasonNumber: 1, watchedFraction: 1 },
      { seasonNumber: 2, watchedFraction: 0.5 },
    ]);
  });

  it('skips specials for next-up and segments', () => {
    const { nextLabel, segments } = getShowPosition([
      season(0, [false]),
      season(1, [true]),
    ]);

    expect(nextLabel).toBeNull();
    expect(segments).toEqual([{ seasonNumber: 1, watchedFraction: 1 }]);
  });

  it('returns null nextLabel when everything is watched', () => {
    expect(getShowPosition([season(1, [true])]).nextLabel).toBeNull();
  });

  it('handles empty and episode-less seasons', () => {
    expect(getShowPosition([])).toEqual({ nextLabel: null, segments: [] });
    expect(getShowPosition([season(1, [])]).segments).toEqual([
      { seasonNumber: 1, watchedFraction: 0 },
    ]);
  });
});
