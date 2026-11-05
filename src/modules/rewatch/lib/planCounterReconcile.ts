import { describeSeasonRewatch } from '@/modules/rewatch/lib/seasonRewatch';

export type CounterKind = 'episode' | 'season' | 'show' | 'movie';

export type CounterDrift = {
  kind: CounterKind;
  id: string;
  label: string;
  stored: number;
  expected: number;
};

export type EpisodeCounterRow = { id: string; label: string; stored: number; logs: number };
export type ShowCounterRow = { id: string; label: string; stored: number; logs: number };
export type MovieCounterRow = { id: string; label: string; stored: number; logs: number };
export type SeasonCounterRow = {
  id: string;
  label: string;
  stored: number;
  episodes: Array<{ watched: boolean; rewatchCount: number }>;
};

export type CounterSnapshot = {
  episodes: EpisodeCounterRow[];
  seasons: SeasonCounterRow[];
  shows: ShowCounterRow[];
  movies: MovieCounterRow[];
};

/**
 * Compares every stored derived counter with what the rules say it should be.
 *
 * The authority for each table is different on purpose:
 * - episode, show and movie counters mirror their log rows (one log = one watch),
 * - a season counter is derived from its episodes, never from logs, because the
 *   season rule (every episode ≥ 4 watches, at least 2 at ≥ 5) can move by more
 *   than one per watch.
 */
export const planCounterReconcile = (
  snapshot: CounterSnapshot,
): { drift: CounterDrift[]; checked: number } => {
  const drift: CounterDrift[] = [];

  const compare = (
    kind: CounterKind,
    rows: Array<{ id: string; label: string; stored: number; expected: number }>,
  ): void => {
    for (const row of rows) {
      if (row.stored !== row.expected) {
        drift.push({
          kind,
          id: row.id,
          label: row.label,
          stored: row.stored,
          expected: row.expected,
        });
      }
    }
  };

  compare(
    'episode',
    snapshot.episodes.map((row) => ({ ...row, expected: row.logs })),
  );
  compare(
    'show',
    snapshot.shows.map((row) => ({ ...row, expected: row.logs })),
  );
  compare(
    'movie',
    snapshot.movies.map((row) => ({ ...row, expected: row.logs })),
  );
  compare(
    'season',
    snapshot.seasons.map((row) => ({
      ...row,
      expected: describeSeasonRewatch(
        row.episodes.map((episode) => ({
          watched: episode.watched,
          rewatchCount: episode.rewatchCount,
        })),
      ).count,
    })),
  );

  return {
    drift,
    checked:
      snapshot.episodes.length +
      snapshot.seasons.length +
      snapshot.shows.length +
      snapshot.movies.length,
  };
};
