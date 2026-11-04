-- Personal notes become their own many-per-media table, independent from the
-- single rating on the tracking rows. Existing `MovieTracking.notes` /
-- `EpisodeTracking.notes` values are backfilled first, then the columns are
-- dropped so there is exactly one home for note content.

CREATE TABLE "media_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_type" "CommentMediaType" NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_notes_user_id_media_type_tmdb_id_created_at_idx"
    ON "media_notes"("user_id", "media_type", "tmdb_id", "created_at");

ALTER TABLE "media_notes" ADD CONSTRAINT "media_notes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Movie notes: the owner is the movie row's user.
INSERT INTO "media_notes" ("id", "user_id", "media_type", "tmdb_id", "content", "created_at", "updated_at")
SELECT gen_random_uuid()::text,
       m."userId",
       'movie'::"CommentMediaType",
       m."tmdbId",
       btrim(mt."notes"),
       COALESCE(mt."updatedAt", CURRENT_TIMESTAMP),
       COALESCE(mt."updatedAt", CURRENT_TIMESTAMP)
  FROM "MovieTracking" AS mt
  JOIN "Movie" AS m ON m."id" = mt."movieId"
 WHERE mt."notes" IS NOT NULL AND btrim(mt."notes") <> '';

-- Episode notes: walk episode -> season -> show to find the owner.
INSERT INTO "media_notes" ("id", "user_id", "media_type", "tmdb_id", "content", "created_at", "updated_at")
SELECT gen_random_uuid()::text,
       s."userId",
       'episode'::"CommentMediaType",
       e."tmdbId",
       btrim(et."notes"),
       COALESCE(et."updatedAt", CURRENT_TIMESTAMP),
       COALESCE(et."updatedAt", CURRENT_TIMESTAMP)
  FROM "EpisodeTracking" AS et
  JOIN "Episode" AS e ON e."id" = et."episodeId"
  JOIN "Season" AS season ON season."id" = e."seasonId"
  JOIN "Show" AS s ON s."id" = season."showId"
 WHERE et."notes" IS NOT NULL AND btrim(et."notes") <> '';

ALTER TABLE "MovieTracking" DROP COLUMN "notes";
ALTER TABLE "EpisodeTracking" DROP COLUMN "notes";
