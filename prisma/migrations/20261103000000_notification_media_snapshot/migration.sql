-- Snapshot the commented-on media on each notification so the header bell
-- keeps rendering after the media leaves every library. Existing rows are
-- backfilled from the mention author's own library copy; rows whose media is
-- gone everywhere keep an empty title (the bell renders a generic label).

ALTER TABLE "notifications" ADD COLUMN "media_type" "CommentMediaType" NOT NULL DEFAULT 'movie';
ALTER TABLE "notifications" ADD COLUMN "tmdb_id" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "notifications" ADD COLUMN "media_title" TEXT NOT NULL DEFAULT '';

-- One statement for every media kind. Correlated subqueries (rather than
-- JOIN ... ON) because Postgres cannot reference the UPDATE target table
-- inside a join condition.
UPDATE "notifications" AS n
SET "media_type" = c."media_type",
    "tmdb_id" = c."tmdb_id",
    "media_title" = COALESCE(
      (SELECT m."name"
         FROM "Movie" AS m
        WHERE m."tmdbId" = c."tmdb_id" AND m."userId" = n."actor_id"
        LIMIT 1),
      (SELECT s."name"
         FROM "Show" AS s
        WHERE s."tmdbId" = c."tmdb_id" AND s."userId" = n."actor_id"
        LIMIT 1),
      (SELECT e."name"
         FROM "Episode" AS e
         JOIN "Season" AS season ON season."id" = e."seasonId"
         JOIN "Show" AS episode_show
           ON episode_show."id" = season."showId"
          AND episode_show."userId" = n."actor_id"
        WHERE e."tmdbId" = c."tmdb_id"
        LIMIT 1),
      ''
    )
FROM "comments" AS c
WHERE n."comment_id" = c."id";

ALTER TABLE "notifications" ALTER COLUMN "media_type" DROP DEFAULT;
ALTER TABLE "notifications" ALTER COLUMN "tmdb_id" DROP DEFAULT;
ALTER TABLE "notifications" ALTER COLUMN "media_title" DROP DEFAULT;

-- One notification per (recipient, comment): repeats from double-submits or
-- re-mentions collapse into a single row.
CREATE UNIQUE INDEX "notifications_recipient_id_comment_id_key" ON "notifications"("recipient_id", "comment_id");
