import { describe, expect, it } from 'vitest';
import { parseModerationDecision } from '@/modules/comments/lib/parseModerationDecision';

describe('parseModerationDecision', () => {
  it('accepts both decisions and an optional reason', () => {
    expect(parseModerationDecision({ commentId: 'c1', action: 'hide', reason: 'abuse' })).toEqual({
      ok: true,
      value: { commentId: 'c1', action: 'hide', reason: 'abuse' },
    });
    expect(parseModerationDecision({ commentId: 'c1', action: 'dismiss' })).toEqual({
      ok: true,
      value: { commentId: 'c1', action: 'dismiss' },
    });
  });

  it('rejects a non-object body', () => {
    expect(parseModerationDecision(null)).toEqual({
      ok: false,
      error: 'Expected { commentId, action: "hide" | "dismiss", reason? }.',
    });
    expect(parseModerationDecision(['hide'])).toMatchObject({ ok: false });
  });

  it('rejects an unknown action and names the allowed ones', () => {
    const result = parseModerationDecision({ commentId: 'c1', action: 'delete' });
    expect(result).toEqual({
      ok: false,
      error: 'action must be one of: hide, dismiss.',
    });
  });

  it('rejects an empty comment id and a non-string reason', () => {
    expect(parseModerationDecision({ commentId: '  ', action: 'hide' })).toEqual({
      ok: false,
      error: 'commentId must be a non-empty string.',
    });
    expect(parseModerationDecision({ commentId: 'c1', action: 'hide', reason: 4 })).toEqual({
      ok: false,
      error: 'reason must be a string when present.',
    });
  });
});
