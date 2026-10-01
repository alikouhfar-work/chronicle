import { describe, expect, it } from 'vitest';
import { buildTrackingTimestamps, deriveShowStatus } from './tracking';

describe('buildTrackingTimestamps', () => {
  it('clears dates when planning to watch', () => {
    expect(buildTrackingTimestamps('PLAN_TO_WATCH', new Date(), new Date())).toEqual({
      startedAt: null,
      completedAt: null,
    });
  });

  it('stamps completion and preserves an existing start', () => {
    const started = new Date('2024-01-01');
    const now = new Date('2024-02-01');

    expect(buildTrackingTimestamps('COMPLETED', started, now)).toEqual({
      startedAt: started,
      completedAt: now,
    });
    expect(buildTrackingTimestamps('COMPLETED', null, now)).toEqual({
      startedAt: now,
      completedAt: now,
    });
  });

  it('starts watching without completing', () => {
    const now = new Date();
    expect(buildTrackingTimestamps('WATCHING', null, now)).toEqual({
      startedAt: now,
      completedAt: null,
    });
    expect(buildTrackingTimestamps('DROPPED', null, now)).toEqual({
      startedAt: now,
      completedAt: null,
    });
  });
});

describe('deriveShowStatus', () => {
  it('derives completion, watching and plan states', () => {
    expect(deriveShowStatus(10, 10)).toBe('COMPLETED');
    expect(deriveShowStatus(10, 3)).toBe('WATCHING');
    expect(deriveShowStatus(10, 0)).toBe('PLAN_TO_WATCH');
    expect(deriveShowStatus(0, 0)).toBe('PLAN_TO_WATCH');
  });
});
