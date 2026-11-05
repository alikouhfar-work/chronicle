import { describe, expect, it } from 'vitest';
import {
  computeSeasonRewatchCount,
  describeSeasonRewatch,
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

describe('describeSeasonRewatch', () => {
  it('reports the shortfall that gates a watched season', () => {
    const progress = describeSeasonRewatch([2, 2, 1, 4].map(episode));

    expect(progress).toEqual({
      count: 0,
      lowestWatches: 1,
      episodesBelowBaseline: 3,
      episodesAtDeepThreshold: 0,
    });
  });

  it('reports a qualified season with its derived count', () => {
    const progress = describeSeasonRewatch([5, 5, 4, 4].map(episode));

    expect(progress.count).toBe(1);
    expect(progress.lowestWatches).toBe(4);
    expect(progress.episodesBelowBaseline).toBe(0);
    expect(progress.episodesAtDeepThreshold).toBe(2);
  });

  it('distinguishes "baseline met but not deep enough" from "below baseline"', () => {
    const progress = describeSeasonRewatch([4, 4, 4, 5].map(episode));

    expect(progress.episodesBelowBaseline).toBe(0);
    expect(progress.episodesAtDeepThreshold).toBe(1);
    expect(progress.count).toBe(0);
  });

  it('returns zeros for an empty season', () => {
    expect(describeSeasonRewatch([])).toEqual({
      count: 0,
      lowestWatches: 0,
      episodesBelowBaseline: 0,
      episodesAtDeepThreshold: 0,
    });
  });

  it('agrees with computeSeasonRewatchCount at every threshold step', () => {
    const seasons = [
      [0, 0, 0],
      [1, 1, 1],
      [3, 4, 4],
      [4, 4, 4],
      [4, 4, 5],
      [5, 5, 5],
      [6, 5, 4],
    ].map((counts) => counts.map(episode));

    for (const season of seasons) {
      expect(describeSeasonRewatch(season).count).toBe(computeSeasonRewatchCount(season));
    }
  });
});
