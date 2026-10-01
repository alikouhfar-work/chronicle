import { describe, expect, it } from 'vitest';
import { createMonogram } from './createMonogram';

describe('createMonogram', () => {
  it('returns initials for multi-word names', () => {
    expect(createMonogram('Ada Lovelace')).toBe('AL');
    expect(createMonogram('  pedro   pascal  ')).toBe('PP');
  });

  it('returns two letters for single names', () => {
    expect(createMonogram('Zendaya')).toBe('ZE');
  });

  it('skips honorifics and handles empty input', () => {
    expect(createMonogram('Dr Strange')).toBe('ST');
    expect(createMonogram('')).toBe('');
    expect(createMonogram('   ')).toBe('');
  });
});
