# Implementation log

Chronological record of every change to Chronicle. One entry per work package or
fix, newest last. An entry is written when the change ships — an undocumented
change counts as unfinished.

Format:

```
## YYYY-MM-DD — WP-XX · Title (commit abc1234)
- Change: …
- Migration: …
- Verified: …
- Notes: …
```

Companion documents: `docs/gap-analysis.md` (what is wrong and why),
`docs/remediation-plan.md` (ordering and status), `SKILL.md` (current contracts).

---

## 2026-11-04 — UI consistency, mentions, object storage, unread loop (commit a5e6b81)
- Change: one shared `BackButton` on every page header; sign-out moved to the
  profile page; mentions rendered as chips via `tokenizeMentions`; comment
  attachments moved to an S3-compatible `StorageProvider` with a local-disk
  fallback; fixed the `getUnreadCount` render-phase loop (notification bell now
  fetches from an effect keyed on `pathname`).
- Migration: none.
- Verified: build, unit tests, live walkthrough of the bell and attachment
  upload; loop reproduced before the fix and absent after.
- Notes: the loop was a server action invoked during render, which queued a
  Router update while rendering the bell.

## 2026-11-04 — Tabbed notes/reviews, own-content editing, decoupled ratings (commit 58206d7)
- Change: movie detail page uses one `MediaCommentTabs` (Personal notes +
  Public reviews); episode cards lost their duplicate action buttons; authors
  can edit/delete their own notes and comments; ratings became independent of
  notes (`MovieTracking.rating` / `EpisodeTracking.rating`, nullable);
  `MediaNote` introduced as many-per-media, private, soft-deleted.
- Migration: `20261104120000_media_notes` (new table, backfill of legacy note
  columns, then drop them).
- Verified: unit tests, live edit/delete flows, rating without a note.
- Notes: notes and comments are deliberately separate audiences; ratings live
  only on tracking rows.

## 2026-11-04 — Show/season watch dialogs + derived season rewatch counts (commit e943b5d)
- Change: one `WatchActionModal` for episode/season/show; `unwatchMedia` clears
  watches without deleting tracking rows (ratings survive); season rewatch count
  became derived (`rewatch/lib/seasonRewatch.ts`): all episodes ≥ 4 watches and
  ≥ 2 at ≥ 5, count = lowest − 3; cascade deletion of a season/show log.
- Migration: `20261104130000_season_rewatch_rule` (recomputed drifted counters;
  4 of 14 seasons disagreed with the rule).
- Verified: 10 rule tests, 9 integration tests against Postgres, browser run of
  both dialogs, data rollback afterwards.
- Notes: severity of the drift proved that stored counters need reconciliation.

## 2026-11-04 — Movie watch dialog, watched-state interception (commit c3d771e)
- Change: `WatchActionModal` accepts `movie`; `clearMovieWatchHistory` resets a
  completed movie to Plan to Watch while keeping its rating; `RewatchButton`
  intercepts when an item has been watched (count ≥ 1 **or** completed status).
- Migration: none.
- Verified: 6 component tests, 2 new integration cases, live Rewatch/Unwatch on
  a real movie with DB checks and rollback.
- Notes: completed-with-zero-logs was the case that motivated the `watched`
  prop.

## 2026-11-04 — Naming refactor (commit f47d764)
- Change: dead code removed (`unwatchEpisode`, `parseRewatchedAt`,
  `RatingStars`); folder-named files split one-export-per-file (notifications,
  media queries, episode details); `withTrackedFlags` → `attachTrackedFlags`;
  `setShowWatched(id, true)` → `markShowWatched(id)` (the `false` branches were
  unreachable and destructive); `seriesWatched` → `showWatched`;
  `SearchResultResponse` → `SearchResponse`, `MappedUpcomingEpisodeItem` →
  `UpcomingEpisodeItem`.
- Migration: none.
- Verified: tsc, eslint, 238 tests, build.
- Notes: `'tv'` remains only as the TMDB path segment and the `/library/tv`
  route; a URL-level rename was deliberately out of scope.

## 2026-11-04 — Unified empty/error/focus states (commit d589fd8)
- Change: `shared/ui/ErrorState` replaced two 200-line diagnostic screens (stack
  traces, a "Copy Report" button that only scrolled up); `shared/ui/EmptyState`
  replaced six divergent empty panels; search gained an empty state; CSP-less
  focus handling replaced by a global `:focus-visible` ring; dead `.arch-*`
  utility layer deleted; reduced-motion now covers transforms and fades;
  fine print moved off `text-zinc-500` (4.02:1) to `zinc-400` (7.57:1); missing
  `loading.tsx` added for profile, episode and title details.
- Migration: none.
- Verified: 9 component tests, error boundary exercised through a temporary
  throwing route, keyboard focus verified via CDP, build.

## 2026-11-04 — Database integrity pass (commit 1cabe66)
- Change: CHECK constraints (rating 1–5, non-blank content, non-negative
  attachment size, positive dimensions, `rewatch_logs` pointer ↔ typed FKs);
  `Episode(airDate, episodeNumber)` index (the upcoming scan was a full table
  scan); removed redundant `Show_userId_idx` / `Movie_userId_idx`; cursor
  indexes gained the `id` tiebreak; show progress now derives its denominator
  from stored episodes instead of TMDB's drifting `numberOfEpisodes` (House of
  the Dragon: 115 stored vs 26 reported).
- Migration: `20261104160000_schema_integrity`.
- Verified: constraint rejections exercised on a scratch database, EXPLAIN
  before/after (seq scan → index scan), 249 tests, 11/11 integration.
- Notes: Prisma cannot express CHECKs; they must be re-added if the chain is
  reset.

## 2026-11-05 — Phase 0: safety net (commit a2f25fb)
- Change: cascade regression suite with two `it.fails` cases reproducing the
  timestamp-identity bug; fixtures extracted to
  `rewatch/__fixtures__/rewatchFixture.ts`; integration runs serialised
  (`fileParallelism: false`, `maxWorkers: 1`); CI workflow (tsc, lint, unit,
  migrate deploy, `migrate diff --exit-code`, integration, build);
  `src/infra/logging/logger.ts` with redaction, wired into all 24
  `console.error` sites plus the three error boundaries.
- Migration: none.
- Verified: 257 unit tests, 29 integration + 2 expected failures, build.
- Notes: also committed `docs/gap-analysis.md` and `docs/remediation-plan.md`.

## 2026-11-05 — WP-04 cascade identity, WP-05 upload hardening (commit 1898be3)
- Change: `rewatch_logs.group_id` (backfilled self → season parent → show
  parent), deletion targets the group instead of `rewatched_at`; a season row
  inside a show batch is a child and deletes only itself; episode counters
  decrement per affected episode. Uploads: `readCappedBody` streaming cap,
  `sniffImageType` magic bytes, stored type/key from the sniff, nosniff on every
  response, `.data/` gitignored.
- Migration: `20261105090000_rewatch_group_id`.
- Verified: backfill on a dump (403 logs, 0 null groups, 29 groups), 33/33
  integration, live uploads (PNG 200, HTML-as-PNG 415, 6 MB 413).
- Notes: two `it.fails` cases flipped to real assertions.

## 2026-11-05 — WP-06 security headers, WP-07 attachment lifecycle (commit b50324d)
- Change: `buildSecurityHeaders` (nosniff, DENY framing, referrer policy,
  Permissions-Policy, HSTS in prod, CSP report-only) applied to every route;
  `CommentAttachment.storageKey`; `StorageProvider.list/remove` for S3 and disk;
  `/api/maintenance/attachments` orphan sweep behind `CRON_SECRET`; upload quota
  (250 MB, 40/day) checked before the body is read; production fails fast
  without a bucket.
- Migration: `20261105120000_attachment_storage_key`.
- Verified: headers live, sweep 401 without secret, quota path live, 284 tests.
- Notes: the sweep is a backstop now that deletes are immediate (WP-23).

## 2026-11-05 — WP-08 idempotent rewatch (commit 9640ddb)
- Change: `client_request_id` + unique `(user_id, client_request_id)`;
  `recordRewatch` replays an existing log for the same key, rejects cross-media
  reuse, and re-reads the winner on a concurrent race; dialogs mint one key per
  session; REST accepts `Idempotency-Key`.
- Migration: `20261105140000_rewatch_idempotency`.
- Verified: 36/36 rewatch tests (replay, distinct keys, cross-media rejection).

## 2026-11-05 — WP-23 hard-delete comments (commit 9c7513b)
- Change: `Comment.deletedAt` dropped; `deleteComment` deletes the row
  (cascading mentions, notifications, attachment rows) then removes objects
  best-effort; tombstone filters removed from list/update/get and notification
  availability now means "row exists".
- Migration: `20261105160000_comment_hard_delete` (purges tombstones, drops the
  column).
- Verified: dump-restored copy (12 comments preserved), 5 delete-path tests,
  289 tests, build.
- Notes: product decision D4 — delete means delete.

## 2026-11-05 — WP-09 mention cap (commit pending)
- Change: `COMMENT_MAX_MENTIONS = 10`; `createComment` counts distinct handles
  before resolving them and rejects the write with a clear message past the cap.
  Duplicates of one handle count once, so a long reply pinging one person is
  unaffected.
- Migration: none.
- Verified: two new tests (11 distinct handles → rejected before any query or
  write; 30 repeats of two handles → accepted with a two-handle lookup), 64
  comment tests green.
- Notes: C1 (reply notifications) is closed as an accepted limitation per D2
  (flat feed); mentions remain the only notification trigger.

## 2026-11-05 — WP-16 season-rule shortfall (commit pending)
- Change: `describeSeasonRewatch` returns count plus why it is zero
  (`lowestWatches`, `episodesBelowBaseline`, `episodesAtDeepThreshold`);
  `computeSeasonRewatchCount` delegates so the rule has one implementation. The
  season header now explains a watched-but-zero season: "Season rewatch unlocks
  at 4 watches per episode — 8 episodes below 4 watches."
- Migration: none.
- Verified: 5 new describe tests (including agreement with the counter at every
  threshold step) and a live check on a real season with 8 episodes at 1 watch.
- Notes: the threshold text comes from `SEASON_REWATCH_THRESHOLDS`, so changing
  the rule updates the copy automatically.
