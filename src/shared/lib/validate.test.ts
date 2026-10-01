import { describe, expect, it } from 'vitest';
import { ValidationError } from './errors';
import { parseDbId, parseTmdbId, parseWindowDays } from './validate';

describe('parseTmdbId', () => {
  it('accepts positive integers', () => {
    expect(parseTmdbId('42')).toBe(42);
  });

  it('rejects zero, negatives, fractions and non-numbers', () => {
    for (const value of ['0', '-3', '4.5', 'abc', '']) {
      expect(() => parseTmdbId(value)).toThrow(ValidationError);
    }
  });
});

describe('parseDbId', () => {
  it('trims and returns non-empty strings', () => {
    expect(parseDbId('  abc  ')).toBe('abc');
  });

  it('rejects empty and non-string values', () => {
    for (const value of ['', '   ', undefined, null, 42]) {
      expect(() => parseDbId(value)).toThrow(ValidationError);
    }
  });
});

describe('parseWindowDays', () => {
  it('defaults missing and non-finite values to 30', () => {
    expect(parseWindowDays(undefined)).toBe(30);
    expect(parseWindowDays(null)).toBe(30);
    expect(parseWindowDays(Number.NaN)).toBe(30);
  });

  it('clamps to the 1..90 range and floors fractions', () => {
    expect(parseWindowDays(0)).toBe(1);
    expect(parseWindowDays(500)).toBe(90);
    expect(parseWindowDays(7.9)).toBe(7);
    expect(parseWindowDays('14')).toBe(14);
  });
});
