-- Scope public comments by TMDB id instead of the per-user internal row id.
--
-- Existing rows are backfilled by resolving the old internal media id against
-- the library tables. Rows whose media has since been removed from every
-- library cannot be mapped to a TMDB id and are dropped, because keeping them
-- would keep the global feed fragmented.

ALTER TABLE "comments" ADD COLUMN "tmdb_id" INTEGER;

UPDATE "comments" AS c
SET "tmdb_id" = m."tmdbId"
FROM "Movie" AS m
WHERE c."media_type" = 'movie' AND c."media_id" = m."id";

UPDATE "comments" AS c
SET "tmdb_id" = s."tmdbId"
FROM "Show" AS s
WHERE c."media_type" = 'show' AND c."media_id" = s."id";

UPDATE "comments" AS c
SET "tmdb_id" = e."tmdbId"
FROM "Episode" AS e
WHERE c."media_type" = 'episode' AND c."media_id" = e."id";

DELETE FROM "comments" WHERE "tmdb_id" IS NULL;

ALTER TABLE "comments" ALTER COLUMN "tmdb_id" SET NOT NULL;

DROP INDEX IF EXISTS "comments_media_type_media_id_created_at_idx";

ALTER TABLE "comments" DROP COLUMN "media_id";

CREATE INDEX "comments_media_type_tmdb_id_created_at_idx"
ON "comments"("media_type", "tmdb_id", "created_at");
