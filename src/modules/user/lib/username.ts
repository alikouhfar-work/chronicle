export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;

// Leaves room for a `_<n>` collision suffix while staying within 32 chars.
export const USERNAME_BASE_MAX_LENGTH = 28;

const FALLBACK_PREFIX = 'user_';

/** Trims, drops a leading `@`, and lowercases. Does not strip invalid characters. */
export const normalizeUsername = (input: string): string =>
  input.trim().replace(/^@+/, '').toLowerCase();

export const isValidUsername = (value: string): boolean =>
  value.length >= USERNAME_MIN_LENGTH &&
  value.length <= USERNAME_MAX_LENGTH &&
  USERNAME_PATTERN.test(value);

/** `user_<first 8 id chars>`, used when the email local part yields nothing usable. */
export const fallbackUsername = (id: string): string => {
  const idPart = id
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  return `${FALLBACK_PREFIX}${idPart || '0'}`;
};

/**
 * Deterministic base handle: lowercase email local part, invalid characters
 * removed, truncated to leave room for a collision suffix. Falls back to
 * `user_<id-prefix>` when fewer than 3 usable characters remain.
 *
 * Mirrors the SQL backfill in
 * prisma/migrations/20261030130000_backfill_usernames/migration.sql.
 */
export const deriveUsernameBase = (email: string, id: string): string => {
  const localPart = email.split('@')[0] ?? '';
  const cleaned = localPart
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, USERNAME_BASE_MAX_LENGTH);

  if (cleaned.length >= USERNAME_MIN_LENGTH && /[a-z0-9]/.test(cleaned)) return cleaned;
  return fallbackUsername(id).slice(0, USERNAME_MAX_LENGTH);
};

/** `base` for suffix 1, `base_2`, `base_3`, … truncated to fit 32 chars. */
export const withNumericSuffix = (base: string, suffix: number): string => {
  if (suffix <= 1) return base.slice(0, USERNAME_MAX_LENGTH);
  const tail = `_${suffix}`;
  return `${base.slice(0, USERNAME_MAX_LENGTH - tail.length)}${tail}`;
};

/** Ordered, deterministic candidates to try when a handle is already taken. */
export const usernameCandidates = (
  email: string,
  id: string,
  attempts = 25,
): string[] => {
  const base = deriveUsernameBase(email, id);
  return Array.from({ length: attempts }, (_, index) => withNumericSuffix(base, index + 1));
};
