import { invalid, parsed } from '@/shared/lib/parse';
import type { ParseResult } from '@/shared/lib/parse';

export const USER_SEARCH_MIN_LENGTH = 2;
export const USER_SEARCH_MAX_LENGTH = 32;
const USERNAME_PATTERN = /^[a-z0-9_]+$/i;

/**
 * `GET /api/users/search?q=` — the length and charset rules live here so the route
 * stays a transport adapter and the rules can be unit tested.
 */
export const parseUserSearchQuery = (raw: string | null): ParseResult<string> => {
  const q = raw?.trim() ?? '';

  if (q.length < USER_SEARCH_MIN_LENGTH || q.length > USER_SEARCH_MAX_LENGTH) {
    return invalid(`Query must be ${USER_SEARCH_MIN_LENGTH}-${USER_SEARCH_MAX_LENGTH} characters.`);
  }

  if (!USERNAME_PATTERN.test(q)) {
    return invalid('Query must contain only letters, digits and underscores.');
  }

  return parsed(q);
};
