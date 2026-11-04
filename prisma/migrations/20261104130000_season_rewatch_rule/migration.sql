-- Season rewatch counts become derived instead of accumulated (Task 13).
--
-- A season counts as rewatched only when EVERY episode has been watched at
-- least 4 times AND at least two episodes have been watched at least 5 times.
-- The stored value is then the number of complete passes above the baseline
-- (lowest watch count - 3), so a laggard episode decides how many rewatches a
-- season has and early episodes cannot inflate it.
--
-- Episode watch count = rewatch_count + 1 when the episode is marked watched.
-- Recomputing here reconciles counters written by the previous incremental
-- logic with the rule the application now enforces.

WITH episode_watches AS (
  SELECT season.id AS season_id,
         MIN(episode.rewatch_count + CASE WHEN COALESCE(tracking.watched, false) THEN 1 ELSE 0 END) AS lowest,
         COUNT(*) FILTER (
           WHERE episode.rewatch_count + CASE WHEN COALESCE(tracking.watched, false) THEN 1 ELSE 0 END >= 5
         ) AS deep_episodes
    FROM "Season" AS season
    JOIN "Episode" AS episode ON episode."seasonId" = season.id
    LEFT JOIN "EpisodeTracking" AS tracking ON tracking."episodeId" = episode.id
   GROUP BY season.id
)
UPDATE "Season" AS season
   SET "rewatch_count" = CASE
         WHEN watches.lowest >= 4 AND watches.deep_episodes >= 2
           THEN GREATEST(1, watches.lowest - 3)
         ELSE 0
       END
  FROM episode_watches AS watches
 WHERE watches.season_id = season.id;
