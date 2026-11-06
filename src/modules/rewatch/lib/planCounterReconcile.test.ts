import { describe, expect, it } from 'vitest';
import {
  planCounterReconcile,
  type CounterSnapshot,
} from '@/modules/rewatch/lib/planCounterReconcile';

const snapshot = (overrides: Partial<CounterSnapshot> = {}): CounterSnapshot => ({
  episodes: [],
  seasons: [],
  shows: [],
  movies: [],
  ...overrides,
});

/** Season episodes carry the pair the rule reads: logs plus the watched flag. */
const watchedEpisode = (rewatchCount: number, watched = false) => ({ rewatchCount, watched });

describe('planCounterReconcile', () => {
  it('reports nothing when every counter matches its logs', () => {
    const result = planCounterReconcile(
      snapshot({
        episodes: [{ id: 'e1', label: 'S1E1', stored: 2, logs: 2 }],
        shows: [{ id: 's1', label: 'Show', stored: 3, logs: 3 }],
        movies: [{ id: 'm1', label: 'Movie', stored: 1, logs: 1 }],
      }),
    );

    expect(result.drift).toEqual([]);
    expect(result.checked).toBe(3);
  });

  it('reports a drifted episode, show and movie with both values', () => {
    const result = planCounterReconcile(
      snapshot({
        episodes: [{ id: 'e1', label: 'S1E1', stored: 5, logs: 2 }],
        shows: [{ id: 's1', label: 'Show', stored: 0, logs: 4 }],
        movies: [{ id: 'm1', label: 'Movie', stored: 2, logs: 0 }],
      }),
    );

    expect(result.drift).toEqual([
      { kind: 'episode', id: 'e1', label: 'S1E1', stored: 5, expected: 2 },
      { kind: 'show', id: 's1', label: 'Show', stored: 0, expected: 4 },
      { kind: 'movie', id: 'm1', label: 'Movie', stored: 2, expected: 0 },
    ]);
  });

  it('derives the season counter from the rule, not from its stored value', () => {
    const result = planCounterReconcile(
      snapshot({
        seasons: [
          {
            id: 'season-1',
            label: 'Show · Season 1',
            stored: 0,
            episodes: [4, 4, 5, 5]!.map((count) => watchedEpisode(count)),
          },
        ],
      }),
    );

    // Every episode ≥ 4 watches and two at ≥ 5 → the lowest (4) decides: 4 - 3.
    expect(result.drift).toEqual([
      { kind: 'season', id: 'season-1', label: 'Show · Season 1', stored: 0, expected: 1 },
    ]);
  });

  it('accepts a season whose stored value already follows the rule', () => {
    const result = planCounterReconcile(
      snapshot({
        seasons: [
          {
            id: 'season-1',
            label: 'Show · Season 1',
            stored: 1,
            episodes: [4, 4, 5, 5]!.map((count) => watchedEpisode(count)),
          },
        ],
      }),
    );

    expect(result.drift).toEqual([]);
  });

  it('counts every checked row, including the ones with no drift', () => {
    const result = planCounterReconcile(
      snapshot({
        episodes: [
          { id: 'e1', label: 'a', stored: 1, logs: 1 },
          { id: 'e2', label: 'b', stored: 3, logs: 1 },
        ],
        seasons: [{ id: 's1', label: 'c', stored: 0, episodes: [] }],
      }),
    );

    expect(result.checked).toBe(3);
    expect(result.drift).toHaveLength(1);
  });
});
