import { describe, expect, it } from 'vitest';
import {
  deriveUsernameBase,
  fallbackUsername,
  isValidUsername,
  normalizeUsername,
  USERNAME_MAX_LENGTH,
  withNumericSuffix,
} from './username';

describe('normalizeUsername', () => {
  it('trims, lowercases, and drops a leading @', () => {
    expect(normalizeUsername('  @Alice_99 ')).toBe('alice_99');
  });

  it('does not silently strip invalid characters', () => {
    expect(normalizeUsername('alice smith')).toBe('alice smith');
    expect(isValidUsername(normalizeUsername('alice smith'))).toBe(false);
  });
});

describe('isValidUsername', () => {
  it.each(['abc', 'alice_99', 'a'.repeat(32)])('accepts %s', (value) => {
    expect(isValidUsername(value)).toBe(true);
  });

  it.each(['ab', 'a'.repeat(33), 'Alice', 'alice-smith', 'alice smith', ''])(
    'rejects %j',
    (value) => {
      expect(isValidUsername(value)).toBe(false);
    },
  );
});

describe('deriveUsernameBase', () => {
  it('uses the lowercased local part', () => {
    expect(deriveUsernameBase('Jane.Doe@example.com', 'clx123abc')).toBe('janedoe');
  });

  it('strips characters that are invalid in a handle', () => {
    expect(deriveUsernameBase('alice+movies@example.com', 'clx123abc')).toBe('alicemovies');
  });

  it('keeps underscores', () => {
    expect(deriveUsernameBase('a_b_c@example.com', 'clx123abc')).toBe('a_b_c');
  });

  it('truncates long local parts to leave room for a suffix', () => {
    const base = deriveUsernameBase(`${'a'.repeat(60)}@example.com`, 'clx123abc');
    expect(base).toHaveLength(28);
  });

  it('falls back to user_<id prefix> when the local part is too short', () => {
    expect(deriveUsernameBase('ab@example.com', 'clx123abc')).toBe('user_clx123ab');
  });

  it('falls back when the local part has no usable characters', () => {
    expect(deriveUsernameBase('___@example.com', 'clx123abc')).toBe('user_clx123ab');
  });

  it('is deterministic for the same input', () => {
    const first = deriveUsernameBase('Jane.Doe@example.com', 'clx123abc');
    const second = deriveUsernameBase('Jane.Doe@example.com', 'clx123abc');
    expect(first).toBe(second);
  });
});

describe('fallbackUsername', () => {
  it('sanitizes the id and caps it at 8 characters', () => {
    expect(fallbackUsername('CLX-123-ABC-999')).toBe('user_clx123ab');
  });

  it('never returns an empty id part', () => {
    expect(fallbackUsername('---')).toBe('user_0');
  });
});

describe('withNumericSuffix', () => {
  it('returns the base unchanged for the first attempt', () => {
    expect(withNumericSuffix('janedoe', 1)).toBe('janedoe');
  });

  it('appends a numeric suffix', () => {
    expect(withNumericSuffix('janedoe', 2)).toBe('janedoe_2');
  });

  it('never exceeds the maximum length', () => {
    const value = withNumericSuffix('a'.repeat(28), 1234);
    expect(value.length).toBeLessThanOrEqual(USERNAME_MAX_LENGTH);
    expect(value.endsWith('_1234')).toBe(true);
  });
});
