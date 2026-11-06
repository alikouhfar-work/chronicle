import { afterEach, describe, expect, it, vi } from 'vitest';
import { logError, logEvent, logWarn } from '@/infra/logging/logger';
import { ValidationError } from '@/shared/lib/errors';

const lastLine = (spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> => {
  const calls = spy.mock.calls;
  const line = calls[calls.length - 1]?.[0];
  return JSON.parse(String(line));
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('logEvent', () => {
  it('writes one JSON line with level, event, and timestamp', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({ event: 'comment.create', action: 'createComment' });

    const record = lastLine(spy);
    expect(record.level).toBe('error');
    expect(record.event).toBe('comment.create');
    expect(record.action).toBe('createComment');
    expect(typeof record.time).toBe('string');
    expect(new Date(String(record.time)).toString()).not.toBe('Invalid Date');
  });

  it('keeps the digest so a UI report correlates with the log line', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({ event: 'route.error', digest: 'abc123', error: new Error('boom') });

    expect(lastLine(spy).digest).toBe('abc123');
  });

  it('serialises errors with name and message but no stack', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({ event: 'comment.list', error: new Error('could not load') });

    const record = lastLine(spy) as { error: Record<string, unknown> };
    expect(record.error).toMatchObject({ name: 'Error', message: 'could not load' });
    expect(record.error).not.toHaveProperty('stack');
  });

  it('keeps app error status and retryability', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({ event: 'comment.create', error: new ValidationError('bad input') });

    const record = lastLine(spy) as { error: Record<string, unknown> };
    expect(record.error.name).toBe('ValidationError');
    expect(record.error.status).toBe(400);
  });

  it('redacts sensitive meta keys', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({
      event: 'comment.create',
      meta: {
        route: '/library',
        content: 'my private note body',
        email: 'someone@example.com',
        authToken: 'jwt',
        attachmentCount: 2,
      },
    });

    const record = lastLine(spy) as { meta: Record<string, unknown> };
    expect(record.meta).toEqual({ route: '/library', attachmentCount: 2 });
    expect(JSON.stringify(record)).not.toContain('private note');
    expect(JSON.stringify(record)).not.toContain('example.com');
  });

  it('truncates long messages so a whole comment body cannot leak', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const longMessage = 'x'.repeat(1000);

    logError({ event: 'comment.update', error: new Error(longMessage) });

    const record = lastLine(spy) as { error: { message: string } };
    expect(record.error.message.length).toBeLessThanOrEqual(301);
    expect(record.error.message.endsWith('…')).toBe(true);
  });

  it('routes warn and info to their console methods', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    logWarn({ event: 'upload.quota' });
    logEvent('info', { event: 'cache.warm' });

    expect(lastLine(warn).level).toBe('warn');
    expect(lastLine(log).level).toBe('info');
  });

  it('omits undefined fields instead of writing nulls', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError({ event: 'comment.create', userId: undefined, error: undefined });

    const record = lastLine(spy);
    expect(record).not.toHaveProperty('userId');
    expect(record).not.toHaveProperty('error');
  });
});
