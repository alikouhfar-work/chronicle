import { ValidationError } from '@/shared/lib/errors';

export const parseRewatchedAt = (value: unknown, now: Date = new Date()): Date => {
  if (value === undefined || value === null || value === '') {
    return now;
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('rewatched_at must be a valid date');
  }

  return date;
};
