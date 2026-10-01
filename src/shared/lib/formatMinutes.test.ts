import { describe, expect, it } from 'vitest';
import { formatMinutes } from './formatMinutes';

describe('formatMinutes', () => {
  it('formats minutes, hours and days', () => {
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h 0m');
    expect(formatMinutes(90)).toBe('1h 30m');
    expect(formatMinutes(1500)).toBe('1d 1h 0m');
  });

  it('floors fractional minutes', () => {
    expect(formatMinutes(90.9)).toBe('1h 30m');
  });

  it('guards non-positive and non-finite input', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(-5)).toBe('0m');
    expect(formatMinutes(Number.NaN)).toBe('0m');
    expect(formatMinutes(Number.POSITIVE_INFINITY)).toBe('0m');
  });
});
