import { ValidationError } from './errors';

const assertNonEmptyString: (value: unknown, name: string) => asserts value is string = (
  value,
  name,
) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${name} must be a non-empty string`);
  }
};

export const parseTmdbId = (value: string, name = 'tmdbId'): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`${name} must be a positive integer, got "${value}"`);
  }
  return id;
};

export const parseDbId = (value: unknown, name = 'id'): string => {
  assertNonEmptyString(value, name);
  return value.trim();
};

const MIN_WINDOW_DAYS = 1;
const MAX_WINDOW_DAYS = 90;
const DEFAULT_WINDOW_DAYS = 30;

export const parseWindowDays = (value: unknown): number => {
  if (value === undefined || value === null) return DEFAULT_WINDOW_DAYS;
  const days = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(days)) return DEFAULT_WINDOW_DAYS;
  return Math.min(MAX_WINDOW_DAYS, Math.max(MIN_WINDOW_DAYS, Math.floor(days)));
};
