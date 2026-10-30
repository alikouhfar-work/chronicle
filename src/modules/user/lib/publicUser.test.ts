import { describe, expect, it } from 'vitest';
import { publicUserSelect } from './publicUser';

describe('publicUserSelect', () => {
  it('exposes only the public profile fields', () => {
    expect(Object.keys(publicUserSelect)).toEqual(['id', 'username', 'name', 'image']);
  });

  it('never exposes email or credentials', () => {
    const fields = Object.keys(publicUserSelect);
    expect(fields).not.toContain('email');
    expect(fields).not.toContain('passwordHash');
  });
});
