import { describe, expect, it } from 'vitest';
import { addDays, subDays } from 'date-fns';
import { getDaysUntilAirDate } from './getDaysUntilAirDate';

describe('getDaysUntilAirDate', () => {
  it('returns null for missing dates', () => {
    expect(getDaysUntilAirDate(null)).toBeNull();
  });

  it('labels today, tomorrow and yesterday', () => {
    expect(getDaysUntilAirDate(new Date())).toBe('Today');
    expect(getDaysUntilAirDate(addDays(new Date(), 1))).toBe('Tomorrow');
    expect(getDaysUntilAirDate(subDays(new Date(), 1))).toBe('Yesterday');
  });

  it('counts future and past days', () => {
    expect(getDaysUntilAirDate(addDays(new Date(), 5))).toBe('in 5 days');
    expect(getDaysUntilAirDate(subDays(new Date(), 5))).toBe('5 days ago');
  });
});
