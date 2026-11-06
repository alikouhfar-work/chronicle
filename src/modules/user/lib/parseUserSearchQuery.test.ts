import { describe, expect, it } from 'vitest';
import { parseUserSearchQuery } from '@/modules/user/lib/parseUserSearchQuery';

describe('parseUserSearchQuery', () => {
  it('trims and accepts a username fragment', () => {
    expect(parseUserSearchQuery('  ali ')).toEqual({ ok: true, value: 'ali' });
  });

  it('rejects an empty or missing query', () => {
    expect(parseUserSearchQuery(null)).toMatchObject({ ok: false });
    expect(parseUserSearchQuery('  ')).toEqual({
      ok: false,
      error: 'Query must be 2-32 characters.',
    });
  });

  it('rejects a query longer than 32 characters', () => {
    expect(parseUserSearchQuery('a'.repeat(33))).toEqual({
      ok: false,
      error: 'Query must be 2-32 characters.',
    });
  });

  it('rejects characters that cannot appear in a handle', () => {
    expect(parseUserSearchQuery('a b')).toEqual({
      ok: false,
      error: 'Query must contain only letters, digits and underscores.',
    });
    expect(parseUserSearchQuery('ali@')).toMatchObject({ ok: false });
    expect(parseUserSearchQuery('sam_2')).toMatchObject({ ok: true });
  });
});
