import { describe, expect, it } from 'vitest';
import { tokenizeMentions } from '@/modules/comments/lib/tokenizeMentions';

describe('tokenizeMentions', () => {
  it('returns a single text segment when there are no mentions', () => {
    expect(tokenizeMentions('No handles here.')).toEqual([
      { type: 'text', value: 'No handles here.' },
    ]);
  });

  it('splits a mid-sentence mention into text + chip segments', () => {
    expect(tokenizeMentions('Nice take @Alikouhfar, agreed')).toEqual([
      { type: 'text', value: 'Nice take ' },
      { type: 'mention', handle: 'alikouhfar', raw: '@Alikouhfar' },
      { type: 'text', value: ', agreed' },
    ]);
  });

  it('ignores emails and handles glued to other word characters', () => {
    expect(tokenizeMentions('mail me at a@b.com or x@handle')).toEqual([
      { type: 'text', value: 'mail me at a@b.com or x@handle' },
    ]);
  });

  it('leaves mentions inside inline code and fenced blocks literal', () => {
    const content = 'see `@handle` and\n```\n@other\n```\nbut @realone';
    const segments = tokenizeMentions(content);

    expect(segments.filter((segment) => segment.type === 'mention')).toEqual([
      { type: 'mention', handle: 'realone', raw: '@realone' },
    ]);
    expect(content.slice(0, content.indexOf('@realone'))).toContain('`@handle`');
  });

  it('keeps surrounding newlines intact for whitespace-pre-wrap rendering', () => {
    expect(tokenizeMentions('line1\n@handle\nline2')).toEqual([
      { type: 'text', value: 'line1\n' },
      { type: 'mention', handle: 'handle', raw: '@handle' },
      { type: 'text', value: '\nline2' },
    ]);
  });
});
