import { describe, expect, it, vi } from 'vitest';
import { mapWithConcurrency } from './async';

describe('mapWithConcurrency', () => {
  it('preserves input order regardless of completion order', async () => {
    const delays = [30, 5, 20, 1];
    const result = await mapWithConcurrency(delays, 4, async (ms, index) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      return index;
    });

    expect(result).toEqual([0, 1, 2, 3]);
  });

  it('never exceeds the concurrency limit', async () => {
    let running = 0;
    let peak = 0;

    await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
    });

    expect(peak).toBeLessThanOrEqual(2);
  });

  it('propagates worker errors', async () => {
    const failing = vi.fn(async () => {
      throw new Error('worker failed');
    });

    await expect(mapWithConcurrency([1, 2], 2, failing)).rejects.toThrow('worker failed');
  });
});
