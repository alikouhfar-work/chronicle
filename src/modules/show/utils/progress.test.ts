import { describe, expect, it } from 'vitest';
import { getShowProgress } from './getShowProgress';
import { getAverageEpisodeRuntime } from './getAverageEpisodeRuntime';
import { shouldSyncShow } from './shouldSyncShow';
import type { Season } from '@/modules/episode-season';
import type { TrackedShow } from '@/modules/show';

const season = (seasonNumber: number, watched: boolean[]): Season =>
  ({
    id: `s-${seasonNumber}`,
    seasonNumber,
    episodes: watched.map((isWatched, index) => ({
      id: `e-${seasonNumber}-${index}`,
      tracking: isWatched ? { watched: true } : null,
      runtime: 45,
      airDate: new Date('2024-01-01'),
    })),
  }) as unknown as Season;

describe('getShowProgress', () => {
  it('computes the watched percentage excluding specials', () => {
    const seasons = [season(0, [true, true]), season(1, [true, false, false, false])];
    expect(getShowProgress(seasons, 4)).toBe(25);
  });

  it('guards division by zero', () => {
    expect(getShowProgress([], 0)).toBe(0);
  });
});

describe('getAverageEpisodeRuntime', () => {
  it('averages runtimes excluding specials and missing values', () => {
    const show = {
      seasons: [
        { seasonNumber: 0, episodes: [{ runtime: 200 }] },
        { seasonNumber: 1, episodes: [{ runtime: 40 }, { runtime: 50 }, { runtime: null }] },
      ],
    } as unknown as TrackedShow;

    expect(getAverageEpisodeRuntime(show)).toBe(45);
  });

  it('returns null when no runtime is known', () => {
    const show = {
      seasons: [{ seasonNumber: 1, episodes: [{ runtime: null }] }],
    } as unknown as TrackedShow;

    expect(getAverageEpisodeRuntime(show)).toBeNull();
  });
});

describe('shouldSyncShow', () => {
  it('requests a sync when an episode aired since the last sync', () => {
    const show = {
      inProduction: false,
      lastSyncedAt: new Date('2024-01-01'),
      seasons: [
        {
          episodes: [{ airDate: new Date('2024-02-01') }, { airDate: new Date('2025-01-01') }],
        },
      ],
    } as unknown as TrackedShow;

    expect(shouldSyncShow(show)).toBe(true);
  });

  it('skips sync when nothing new aired', () => {
    const show = {
      inProduction: false,
      lastSyncedAt: new Date('2024-06-01'),
      seasons: [{ episodes: [{ airDate: new Date('2024-02-01') }] }],
    } as unknown as TrackedShow;

    expect(shouldSyncShow(show)).toBe(false);
  });
});
