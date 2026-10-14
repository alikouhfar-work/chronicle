import { describe, expect, it } from 'vitest';
import { getShowLifecycle } from './showLifecycle';

describe('getShowLifecycle', () => {
  it('maps returning and in-production shows to continuing', () => {
    expect(getShowLifecycle('Returning Series', true)).toBe('continuing');
    expect(getShowLifecycle('Returning Series', false)).toBe('continuing');
    expect(getShowLifecycle('In Production', true)).toBe('continuing');
  });

  it('falls back to inProduction when the status text is unrecognized', () => {
    expect(getShowLifecycle('Some Future Status', true)).toBe('continuing');
  });

  it('maps ended and canceled shows to ended', () => {
    expect(getShowLifecycle('Ended', false)).toBe('ended');
    expect(getShowLifecycle('Canceled', false)).toBe('ended');
    // Ended wins over a stale inProduction flag.
    expect(getShowLifecycle('Ended', true)).toBe('ended');
  });

  it('returns null for pre-air and unknown statuses', () => {
    expect(getShowLifecycle('Planned', false)).toBeNull();
    expect(getShowLifecycle('Pilot', false)).toBeNull();
    expect(getShowLifecycle(null, false)).toBeNull();
    expect(getShowLifecycle(undefined, false)).toBeNull();
  });
});
