import { describe, expect, it } from 'vitest';
import { extractMentionHandles } from '@/modules/comments/lib/mentions';

describe('extractMentionHandles', () => {
  it('extracts valid handles case-insensitively and only once', () => {
    expect(extractMentionHandles('Hi @Alice, meet @alice and @bob_2.')).toEqual([
      'alice',
      'bob_2',
    ]);
  });

  it('does not extract handles from inline or fenced code', () => {
    const content = [
      'Hello @realuser, `@inlinecode` stays literal.',
      '```ts',
      'const handle = "@blockcode";',
      '```',
      '~~~text',
      '@tildecode',
      '~~~',
    ].join('\n');

    expect(extractMentionHandles(content)).toEqual(['realuser']);
  });

  it('does not extract email addresses or embedded at-signs', () => {
    expect(extractMentionHandles('mail me at person@example.com; @@notuser and x@hidden.')).toEqual(
      [],
    );
  });

  it('rejects handles outside the 3-32 character grammar', () => {
    expect(extractMentionHandles('@ab @'.concat('a'.repeat(33), ' @valid_123'))).toEqual([
      'valid_123',
    ]);
  });
});
