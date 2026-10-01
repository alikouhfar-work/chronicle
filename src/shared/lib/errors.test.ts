import { describe, expect, it } from 'vitest';
import {
  AppError,
  DatabaseError,
  ExternalServiceError,
  getErrorMessage,
  NotFoundError,
  toAppError,
  ValidationError,
} from './errors';

describe('AppError subclasses', () => {
  it('assigns codes, statuses and retryability', () => {
    expect(new ValidationError('bad')).toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
      retryable: false,
    });
    expect(new NotFoundError()).toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(new DatabaseError()).toMatchObject({
      code: 'DATABASE_ERROR',
      status: 503,
      retryable: true,
    });
    expect(new ExternalServiceError('TMDB', 'boom')).toMatchObject({
      code: 'EXTERNAL_SERVICE_ERROR',
      status: 502,
      service: 'TMDB',
    });
    expect(new AppError('x').message).toBe('x');
  });
});

describe('toAppError', () => {
  it('passes AppError instances through untouched', () => {
    const original = new ValidationError('bad');
    expect(toAppError(original)).toBe(original);
  });

  it('maps Prisma P2025 to NotFoundError and other P-codes to DatabaseError', () => {
    const missing = Object.assign(new Error('gone'), { code: 'P2025' });
    expect(toAppError(missing)).toBeInstanceOf(NotFoundError);

    const other = Object.assign(new Error('constraint'), { code: 'P2002' });
    const mapped = toAppError(other);
    expect(mapped).toBeInstanceOf(DatabaseError);
    expect(mapped.cause).toBe(other);
  });

  it('wraps plain errors and strings with a fallback message', () => {
    expect(toAppError(new Error(''), 'fallback').message).toBe('fallback');
    expect(toAppError('plain string').message).toBe('plain string');
    expect(toAppError(undefined, 'fallback').message).toBe('fallback');
  });
});

describe('getErrorMessage', () => {
  it('prefers error messages and falls back otherwise', () => {
    expect(getErrorMessage(new Error('nope'))).toBe('nope');
    expect(getErrorMessage('text')).toBe('text');
    expect(getErrorMessage(null, 'fb')).toBe('fb');
    expect(getErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
});
