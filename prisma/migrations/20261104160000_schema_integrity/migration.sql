-- Schema integrity pass: relational constraints, real indexes, and no
-- redundant ones.
--
-- 1. Redundant indexes: every query filters shows/movies by (userId, tmdbId)
--    or by userId alone, and the unique key already covers the leftmost prefix.
-- 2. Episode had no index on airDate, so both upcoming-episode queries seq-scan
--    the whole table (proved with EXPLAIN: 274 rows scanned, 0 returned).
-- 3. Cursor pagination orders by (createdAt, id); adding id keeps the tiebreak
--    inside the index instead of a sort.
-- 4. CHECK constraints for invariants the app already maintains, so a bad
--    writer can no longer sneak past them.

DROP INDEX IF EXISTS "Show_userId_idx";
DROP INDEX IF EXISTS "Movie_userId_idx";

CREATE INDEX "Episode_airDate_episodeNumber_idx" ON "Episode" ("airDate", "episodeNumber");

DROP INDEX IF EXISTS "comments_media_type_tmdb_id_created_at_idx";
CREATE INDEX "comments_media_type_tmdb_id_created_at_id_idx"
  ON "comments" ("media_type", "tmdb_id", "created_at", "id");

DROP INDEX IF EXISTS "notifications_recipient_id_is_read_created_at_idx";
CREATE INDEX "notifications_recipient_id_is_read_created_at_id_idx"
  ON "notifications" ("recipient_id", "is_read", "created_at", "id");

-- Ratings are 1-5 stars and independent from notes; NULL means unrated.
ALTER TABLE "MovieTracking"
  ADD CONSTRAINT "MovieTracking_rating_range" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5);
ALTER TABLE "EpisodeTracking"
  ADD CONSTRAINT "EpisodeTracking_rating_range" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5);

-- rewatch_logs carries the polymorphic pointer (media_type + media_id) *and*
-- typed foreign keys for cascade deletes. They must agree: media_id equals the
-- deepest typed id, and only that media type's columns are populated.
ALTER TABLE "rewatch_logs"
  ADD CONSTRAINT "rewatch_logs_pointer_matches_media_type" CHECK (
    "media_id" = COALESCE("episode_id", "season_id", "show_id", "movie_id")
    AND CASE "media_type"
      WHEN 'episode' THEN "episode_id" IS NOT NULL
                      AND "season_id" IS NOT NULL
                      AND "show_id" IS NOT NULL
                      AND "movie_id" IS NULL
      WHEN 'season'  THEN "season_id" IS NOT NULL
                      AND "show_id" IS NOT NULL
                      AND "episode_id" IS NULL
                      AND "movie_id" IS NULL
      WHEN 'show'    THEN "show_id" IS NOT NULL
                      AND "season_id" IS NULL
                      AND "episode_id" IS NULL
                      AND "movie_id" IS NULL
      WHEN 'movie'   THEN "movie_id" IS NOT NULL
                      AND "show_id" IS NULL
                      AND "season_id" IS NULL
                      AND "episode_id" IS NULL
      ELSE false
    END
  );

ALTER TABLE "comment_attachments"
  ADD CONSTRAINT "comment_attachments_size_nonnegative" CHECK ("size_bytes" >= 0),
  ADD CONSTRAINT "comment_attachments_dimensions_positive" CHECK (
    ("width" IS NULL OR "width" > 0) AND ("height" IS NULL OR "height" > 0)
  );

-- Soft-deleted rows keep their content, so blank bodies are always a bug.
ALTER TABLE "comments"
  ADD CONSTRAINT "comments_content_not_blank" CHECK (length(btrim("content")) > 0);
ALTER TABLE "media_notes"
  ADD CONSTRAINT "media_notes_content_not_blank" CHECK (length(btrim("content")) > 0);
