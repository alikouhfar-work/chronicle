-- Cascade groups: a season/show rewatch writes a parent log plus one log per
-- child, and deleting the parent must remove exactly that batch. Until now the
-- batch was identified by `rewatched_at`, so two batches in the same
-- millisecond (double submit, retry, second tab) were indistinguishable — one
-- delete removed both, and an unrelated episode logged in the same millisecond
-- was swept up with it.
--
-- `group_id` gives every batch an identity. Standalone logs are their own
-- group; children inherit the parent's id.

-- `id` is text (Prisma String), so the group id mirrors that type.
ALTER TABLE "rewatch_logs" ADD COLUMN "group_id" text;

-- 1. Every log is its own group by default.
UPDATE "rewatch_logs" SET "group_id" = "id";

-- 2. Season batches: episode logs adopt the season log written in the same
--    millisecond by the same user for the same season.
UPDATE "rewatch_logs" AS child
SET "group_id" = parent."id"
FROM "rewatch_logs" AS parent
WHERE parent."media_type" = 'season'
  AND child."media_type" = 'episode'
  AND parent."user_id" = child."user_id"
  AND parent."season_id" = child."season_id"
  AND parent."rewatched_at" = child."rewatched_at";

-- 3. Show batches (outermost): season and episode logs adopt the show log.
--    This runs last so it wins over the season grouping above.
UPDATE "rewatch_logs" AS child
SET "group_id" = parent."id"
FROM "rewatch_logs" AS parent
WHERE parent."media_type" = 'show'
  AND child."media_type" IN ('season', 'episode')
  AND child."id" <> parent."id"
  AND parent."user_id" = child."user_id"
  AND parent."show_id" = child."show_id"
  AND parent."rewatched_at" = child."rewatched_at";

ALTER TABLE "rewatch_logs" ALTER COLUMN "group_id" SET NOT NULL;

CREATE INDEX "rewatch_logs_group_id_idx" ON "rewatch_logs" ("group_id");
