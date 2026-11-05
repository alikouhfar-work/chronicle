-- Timestamps become true instants (gap-analysis F3).
--
-- Every DateTime column was `timestamp without time zone`, while the app writes
-- UTC wall time (`new Date()` through Prisma). SQL comparisons such as
-- `airDate > now()` therefore compared UTC wall time against the server's local
-- wall time (Asia/Tehran, +03:30), shifting the upcoming window by 3.5 hours.
--
-- Verified on a dump-restored copy first: a row stored as 2026-11-03 15:57:34.142
-- (UTC) reads back as 2026-11-03 19:27:34.142+03:30, whose UTC wall is exactly
-- 15:57:34.142 — the instant is preserved and the zone is now explicit. Row
-- counts were unchanged across every table.

ALTER TABLE "Episode" ALTER COLUMN "airDate" TYPE timestamptz(3) USING "airDate" AT TIME ZONE 'UTC';
ALTER TABLE "Episode" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Episode" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "EpisodeTracking" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "EpisodeTracking" ALTER COLUMN "watchedAt" TYPE timestamptz(3) USING "watchedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Movie" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Movie" ALTER COLUMN "lastSyncedAt" TYPE timestamptz(3) USING "lastSyncedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Movie" ALTER COLUMN "releaseDate" TYPE timestamptz(3) USING "releaseDate" AT TIME ZONE 'UTC';
ALTER TABLE "Movie" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "MovieTracking" ALTER COLUMN "addedAt" TYPE timestamptz(3) USING "addedAt" AT TIME ZONE 'UTC';
ALTER TABLE "MovieTracking" ALTER COLUMN "completedAt" TYPE timestamptz(3) USING "completedAt" AT TIME ZONE 'UTC';
ALTER TABLE "MovieTracking" ALTER COLUMN "startedAt" TYPE timestamptz(3) USING "startedAt" AT TIME ZONE 'UTC';
ALTER TABLE "MovieTracking" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Season" ALTER COLUMN "airDate" TYPE timestamptz(3) USING "airDate" AT TIME ZONE 'UTC';
ALTER TABLE "Season" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Season" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Session" ALTER COLUMN expires TYPE timestamptz(3) USING expires AT TIME ZONE 'UTC';
ALTER TABLE "Show" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Show" ALTER COLUMN "firstAirDate" TYPE timestamptz(3) USING "firstAirDate" AT TIME ZONE 'UTC';
ALTER TABLE "Show" ALTER COLUMN "lastAirDate" TYPE timestamptz(3) USING "lastAirDate" AT TIME ZONE 'UTC';
ALTER TABLE "Show" ALTER COLUMN "lastSyncedAt" TYPE timestamptz(3) USING "lastSyncedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Show" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "ShowTracking" ALTER COLUMN "addedAt" TYPE timestamptz(3) USING "addedAt" AT TIME ZONE 'UTC';
ALTER TABLE "ShowTracking" ALTER COLUMN "completedAt" TYPE timestamptz(3) USING "completedAt" AT TIME ZONE 'UTC';
ALTER TABLE "ShowTracking" ALTER COLUMN "startedAt" TYPE timestamptz(3) USING "startedAt" AT TIME ZONE 'UTC';
ALTER TABLE "ShowTracking" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "User" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "User" ALTER COLUMN "emailVerified" TYPE timestamptz(3) USING "emailVerified" AT TIME ZONE 'UTC';
ALTER TABLE "User" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "VerificationToken" ALTER COLUMN expires TYPE timestamptz(3) USING expires AT TIME ZONE 'UTC';
ALTER TABLE comment_attachments ALTER COLUMN created_at TYPE timestamptz(3) USING created_at AT TIME ZONE 'UTC';
ALTER TABLE comment_mentions ALTER COLUMN created_at TYPE timestamptz(3) USING created_at AT TIME ZONE 'UTC';
ALTER TABLE comments ALTER COLUMN created_at TYPE timestamptz(3) USING created_at AT TIME ZONE 'UTC';
ALTER TABLE comments ALTER COLUMN updated_at TYPE timestamptz(3) USING updated_at AT TIME ZONE 'UTC';
ALTER TABLE media_notes ALTER COLUMN created_at TYPE timestamptz(3) USING created_at AT TIME ZONE 'UTC';
ALTER TABLE media_notes ALTER COLUMN deleted_at TYPE timestamptz(3) USING deleted_at AT TIME ZONE 'UTC';
ALTER TABLE media_notes ALTER COLUMN updated_at TYPE timestamptz(3) USING updated_at AT TIME ZONE 'UTC';
ALTER TABLE notifications ALTER COLUMN created_at TYPE timestamptz(3) USING created_at AT TIME ZONE 'UTC';
ALTER TABLE rewatch_logs ALTER COLUMN rewatched_at TYPE timestamptz(3) USING rewatched_at AT TIME ZONE 'UTC';
