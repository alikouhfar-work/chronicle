import { describe, expect, it } from 'vitest';
import {
  computeSeasonRewatchCount,
  episodeWatchCount,
  qualifiesForSeasonRewatch,
} from '@/modules/rewatch/lib/seasonRewatch';

const episode = (watchCount: number) => ({
  watched: watchCount > 0,
  rewatchCount: Math.max(0, watchCount - 1),
});

describe('episodeWatchCount', () => {
  it('counts the first viewing plus rewatches', () => {
    expect(episodeWatchCount({ watched: false, rewatchCount: 0 })).toBe(0);
    expect(episodeWatchCount({ watched: true, rewatchCount: 0 })).toBe(1);
    expect(episodeWatchCount({ watched: true, rewatchCount: 3 })).toBe(4);
  });

  it('never returns a negative count', () => {
    expect(episodeWatchCount({ watched: false, rewatchCount: -2 })).toBe(0);
  });
});

describe('season rewatch rule (all episodes >= 4, at least two >= 5)', () => {
  it('rejects a season where every episode has exactly four watches', () => {
    // Baseline met, but nothing went deeper than four.
    const season = [4, 4, 4, 4, 4].map(episode);

    expect(qualifiesForSeasonRewatch(season)).toBe(false);
    expect(computeSeasonRewatchCount(season)).toBe(0);
  });

  it('accepts a season where every episode has four watches and two have five', () => {
    const season = [5, 5, 4, 4, 4].map(episode);

    expect(qualifiesForSeasonRewatch(season)).toBe(true);
    expect(computeSeasonRewatchCount(season)).toBe(1);
  });

  it('rejects a season with one episode below the baseline', () => {
    const season = [5, 5, 4, 4, 3].map(episode);

    expect(qualifiesForSeasonRewatch(season)).toBe(false);
    expect(computeSeasonRewatchCount(season)).toBe(0);
  });

  it('rejects a season with only one deep episode', () => {
    const season = [6, 4, 4, 4, 4].map(episode);

    expect(qualifiesForSeasonRewatch(season)).toBe(false);
    expect(computeSeasonRewatchCount(season)).toBe(0);
  });

  it('counts one complete pass per full rewatch above the baseline', () => {
    expect(computeSeasonRewatchCount([5, 5, 5, 5].map(episode))).toBe(2);
    expect(computeSeasonRewatchCount([6, 6, 6, 6].map(episode))).toBe(3);
  });

  it('does not let early episodes inflate the count', () => {
    // Two episodes at 9 watches, but the laggard only reached the baseline.
    const season = [9, 9, 4, 4].map(episode);

    expect(computeSeasonRewatchCount(season)).toBe(1);
  });

  it('ignores an empty or unwatched season', () => {
    expect(computeSeasonRewatchCount([])).toBe(0);
    expect(computeSeasonRewatchCount([0, 0].map(episode))).toBe(0);
  });

  it('honours custom thresholds', () => {
    const thresholds = { baselineWatches: 2, deepEpisodes: 1, deepWatches: 3 };
    const season = [3, 2].map(episode);

    expect(qualifiesForSeasonRewatch(season, thresholds)).toBe(true);
    // The laggard (2 watches = exactly the custom baseline) still decides.
    expect(computeSeasonRewatchCount(season, thresholds)).toBe(1);
  });
});
