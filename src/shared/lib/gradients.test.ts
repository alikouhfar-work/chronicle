import { describe, expect, it } from 'vitest';
import { getGradientForTitle } from './getGradientForTitle';
import { getPosterPlaceholderColor } from '@/infra/tmdb/images';

describe('getGradientForTitle', () => {
  it('is deterministic per title', () => {
    expect(getGradientForTitle('Dune')).toBe(getGradientForTitle('Dune'));
  });

  it('handles empty and non-string input without crashing', () => {
    expect(getGradientForTitle('')).toContain('from-zinc-');
    expect(getGradientForTitle(undefined as unknown as string)).toContain('from-zinc-');
  });
});

describe('getPosterPlaceholderColor', () => {
  it('delegates to the shared gradient helper', () => {
    expect(getPosterPlaceholderColor('Dune')).toBe(getGradientForTitle('Dune'));
    expect(getPosterPlaceholderColor('')).toBe(getGradientForTitle('untitled'));
  });
});
