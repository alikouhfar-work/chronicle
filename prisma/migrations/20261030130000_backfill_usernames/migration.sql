-- Backfill public handles for accounts created before @mentions existed.
--
-- Rules mirror src/modules/user/lib/username.ts:
--   * lowercase email local part, strip everything outside [a-z0-9_], cap at 28
--   * fall back to user_<first 8 sanitized id chars> when fewer than 3 usable
--     characters remain or the result contains no letter/digit
--   * resolve collisions with _2, _3, … against already-assigned handles
--
-- Idempotent: only rows whose username is NULL are touched, so re-running the
-- script changes nothing.

DO $$
DECLARE
  rec RECORD;
  base TEXT;
  candidate TEXT;
  suffix INTEGER;
BEGIN
  FOR rec IN
    SELECT id, email
    FROM "User"
    WHERE username IS NULL
    ORDER BY "createdAt", id
  LOOP
    base := left(
      regexp_replace(lower(split_part(rec.email, '@', 1)), '[^a-z0-9_]', '', 'g'),
      28
    );

    IF length(base) < 3 OR base !~ '[a-z0-9]' THEN
      base := 'user_' || coalesce(
        nullif(left(regexp_replace(lower(rec.id), '[^a-z0-9]', '', 'g'), 8), ''),
        '0'
      );
    END IF;

    candidate := base;
    suffix := 1;

    WHILE EXISTS (SELECT 1 FROM "User" WHERE username = candidate) LOOP
      suffix := suffix + 1;
      candidate := left(base, 32 - length(suffix::text) - 1) || '_' || suffix;
    END LOOP;

    UPDATE "User" SET username = candidate WHERE id = rec.id;
  END LOOP;
END $$;
