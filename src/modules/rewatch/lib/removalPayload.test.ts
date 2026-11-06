import { describe, expect, it } from 'vitest';
import {
  isWithinUndoWindow,
  parseRemovalPayload,
  REWATCH_UNDO_WINDOW_MS,
  type RemovalPayload,
} from './removalPayload';

const validPayload = (): RemovalPayload => ({
  version: 1,
  remaining: 2,
  logs: [
    {
      id: 'log-1',
      userId: 'user-1',
      mediaType: 'movie',
      mediaId: 'movie-1',
      rewatchedAt: '2026-11-05T10:00:00.000Z',
      groupId: 'log-1',
      clientRequestId: null,
      showId: null,
      seasonId: null,
      episodeId: null,
      movieId: 'movie-1',
    },
  ],
  episodes: [
    {
      id: 'episode-1',
      rewatchCount: 3,
      trackingExists: true,
      watched: true,
      watchedAt: '2026-11-01T10:00:00.000Z',
    },
  ],
  seasons: [{ id: 'season-1', rewatchCount: 1 }],
  shows: [
    {
      id: 'show-1',
      rewatchCount: 2,
      tracking: {
        status: 'COMPLETED',
        startedAt: '2026-10-01T10:00:00.000Z',
        completedAt: '2026-10-02T10:00:00.000Z',
      },
    },
  ],
  movies: [{ id: 'movie-1', rewatchCount: 2, tracking: null }],
});

describe('removal payload', () => {
  it('round-trips a captured removal', () => {
    const payload = validPayload();
    expect(parseRemovalPayload(payload)).toEqual(payload);
  });

  it('accepts a JSON round trip (what the column actually stores)', () => {
    const payload = validPayload();
    expect(parseRemovalPayload(JSON.parse(JSON.stringify(payload)))).toEqual(payload);
  });

  it.each([
    ['not an object', 'nope'],
    ['a missing version', { ...validPayload(), version: undefined }],
    ['a future version', { ...validPayload(), version: 2 }],
    ['a missing array', { ...validPayload(), seasons: undefined }],
    ['a missing leftover count', { ...validPayload(), remaining: undefined }],
    ['a log without a group id', { ...validPayload(), logs: [{ ...validPayload().logs[0], groupId: undefined }] }],
    [
      'a log with a non-string date',
      { ...validPayload(), logs: [{ ...validPayload().logs[0], rewatchedAt: 17 }] },
    ],
    [
      'a season without a counter',
      { ...validPayload(), seasons: [{ id: 'season-1', rewatchCount: 'one' }] },
    ],
  ])('rejects %s', (_label, value) => {
    expect(() => parseRemovalPayload(value)).toThrow(/malformed/);
  });

  it('honours the window border exactly', () => {
    const createdAt = new Date('2026-11-05T10:00:00.000Z');
    const at = (offset: number) => createdAt.getTime() + offset;

    expect(isWithinUndoWindow(createdAt, at(0))).toBe(true);
    expect(isWithinUndoWindow(createdAt, at(REWATCH_UNDO_WINDOW_MS))).toBe(true);
    expect(isWithinUndoWindow(createdAt, at(REWATCH_UNDO_WINDOW_MS + 1))).toBe(false);
  });
});
