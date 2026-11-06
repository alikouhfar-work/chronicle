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

## 2026-11-05 — WP-22 grouped season recompute (commit pending)
- Change: `syncShowSeasonRewatchCounts` loads every season of a show with its
  episode counters in one query, computes each derived count, and writes the
  changes grouped by new value (`updateMany` per distinct value). Used by the
  show-rewatch path and by show-log removal, replacing a per-season loop that
  issued one reload per season inside the transaction.
- Migration: none.
- Verified: 41/41 rewatch integration tests (cascade, groups, idempotency,
  derived counts) against a freshly migrated database; build green.
- Notes: the per-season round trip was the last O(seasons) read pattern in the
  rewatch service; episode and season writes still use the single-season helper.

## 2026-11-05 — WP-10 timestamptz migration (commit pending)
- Change: all 39 application DateTime columns moved to `timestamptz(3)` in
  `schema.prisma`, with the migration converting existing values via
  `AT TIME ZONE 'UTC'`. Queries that compare `airDate` to `now()` now compare
  instants instead of UTC wall time against the server's local wall time
  (Asia/Tehran, +03:30 that the upcoming window was silently shifted by).
  `createComment` keeps its explicit `createdAt` but the workaround comment was
  corrected — the DB default is a real instant now.
- Migration: `20261105180000_timestamptz` (39 ALTER statements).
- Verified: a probe write through Prisma proved the app stores UTC wall time
  (stored 08:07 while local was 11:37); rehearsal on a dump-restored copy kept
  every row and instant exactly (2026-11-03 15:57:34.142 UTC before and after);
  a fresh database built from the whole chain yields an empty `migrate diff`;
  applied to dev (0 naive columns, counts unchanged: 12 comments, 274 episodes,
  403 logs); dashboard, show page and library load with no error state and the
  dashboard still resolves "Next episode".
- Notes: `createComment`'s timestamp workaround is now redundant but harmless.

## 2026-11-05 — WP-12 bell polling: visibility-aware, cached, reconciled
- Change: the bell's two effects merged into one keyed on `pathname`; nothing is
  fetched while `document.visibilityState === 'hidden'` and one refresh runs when
  the tab becomes visible again; the unread count is served through
  `unstable_cache` (`notifications/services/countUnreadNotifications`) tagged
  `notifications`, invalidated by `updateTag` + `revalidateTag` on every write
  that changes it (create, edit, delete comment, mark one, mark all); after a
  mark-read the bell reconciles once the action resolves, because the click also
  navigates and the next mount could otherwise restore the stale number.
- Migration: none.
- Verified: three new fake-timer tests (visible tab → 6 reads in 5 minutes;
  hidden tab → 0 in 5 minutes, then one on `visibilitychange`; hidden on mount →
  no fetch), 20 notification tests, live checks — badge reads 1 with a warm
  cache on repeat navigation and falls to 0 after marking read and stays there.
- Notes: `revalidateTag`/`updateTag` throw without a Next cache store (Vitest,
  scripts), so invalidation is guarded: it can never fail the write, and the
  60 s TTL is the backstop. Invalidation is coarse (one tag for all recipients)
  — at this scale a shared tag costs one recount and avoids a tag per user.

## 2026-11-05 — WP-11 cached TMDB fragments, tag-based invalidation
- Change: the non-user fragments are cached with `unstable_cache` and explicit
  tags (`shared/lib/cacheTags.ts`):genre dictionary (`genres`, 7 days),
  trending rails (`trending`, 1 day), similar titles and credits (`media`,
  7 days). Genre tuples are cached instead of a `Map` because a Map does not
  survive serialisation; the dictionary is rebuilt from them. User-owned reads
  (tracked flags, library rows, ratings) are untouched and stay dynamic.
- `revalidateMediaDetail` now invalidates the `media` tag, the catch-all page
  pattern `/library/[...slug]` and the concrete path — the E2 defect where a
  concrete path under the catch-all route silently stops invalidating. Every
  call is guarded: without a Next cache store (Vitest, scripts) it throws and
  invalidation must never fail the write.
- Migration: none.
- Verified: 4 new invalidation tests (tag + pattern + concrete path, guard
  behaviour, library-only invalidation), 303 unit tests, lint, build; live
  timings on the dev server — first view of a title ~0.79 s, repeat views
  ~0.12 s (550: 1.14 s cold → 0.13 s warm), home renders trending rails with
  genre labels from the cached dictionary, and a real title page renders 40
  cast links from cached credits.
- Notes: `force-dynamic` stays on the five user-scoped pages; the win is inside
  the render, not static rendering. Tags are deliberately coarse: `unstable_cache`
  fixes its tags when the wrapper is built, so per-title tags would need one
  wrapper per title. A per-title cache would need `"use cache"` + `cacheTag()`,
  which this app does not enable yet.

## 2026-11-05 — WP-13 (part) unwatch accounting + editable watch dates
- Change: `RemoveRewatchResult` / `RemoveRewatchActionResult` carry
  `removedLogs`, counted inside the same transaction (parent row plus every
  cascaded child), and the unwatch toast states what actually went away —
  "Watch removed." versus "12 logged watches removed." New
  `updateRewatchLog` service + action moves one log to a different date, scoped
  to the owner (another account's log id reads as missing), leaving counts
  untouched because the season rule depends on how many watches happened, not
  when. `RewatchHistoryModal` rows gained an edit control that swaps the label
  for a `datetime-local` input with save/cancel.
- Migration: none (no soft-delete column yet — see notes).
- Verified: 3 new integration tests (date moved, counts and watched flag
  unchanged; another account's log rejected; a show unwatch reports ≥ 7 removed
  rows for 2 seasons/4 episodes), 44/44 rewatch integration tests, 303 unit
  tests, lint, build exit 0. Live: added a watch in the history dialog, changed
  its date from Nov 5 2026 to Mar 15 2024 9:30 AM through the new control, count
  stayed at 1; probe row and counters then restored.
- Notes: **the undo half of WP-13 is not built.** It needs
  `rewatch_logs.deleted_at`, a soft-delete variant of the clear paths, a
  10-minute toast undo and a purge pass — a schema change plus a background job
  that deserves its own package (`WP-13b`). Until then unwatch stays final, as
  it has been.

## 2026-11-05 — WP-14 counter reconciliation
- Change: `rewatch/lib/planCounterReconcile` compares every derived counter with
  its source of truth — episode/show/movie counters against their log rows, the
  season counter against the season rule (which can move by more than one per
  watch, hence the different authority) — and returns a drift list.
  `rewatch/services/reconcileCounters` reads the snapshot, then writes the
  expected values grouped by target value (one statement per distinct value) when
  asked to fix. `GET /api/maintenance/reconcile` is `CRON_SECRET`-gated; report is
  the default, `?fix=1` repairs.
- Migration: none.
- Verified: 5 unit tests on the planner (clean catalog, three kinds of drift, season
  derived not read, checked count), 2 integration tests on a scratch database
  (drift injected for episode/season/movie, report leaves the rows untouched, fix
  restores 2/0/1, the follow-up report is empty; clean database reports nothing),
  51 rewatch tests total. Live on the dev server with a temporary `CRON_SECRET`:
  401 without the bearer, report `checked: 295, drift: [], fixed: 0`, `?fix=1`
  identical — the dev database has no drift.
- Notes: the route reports TMDB metadata drift nowhere; that belongs to the sync
  paths. The snapshot is four full reads, fine at this size and noted in the
  service if it ever needs paging.

## 2026-11-05 — WP-15 (harness + 6 journeys) Playwright end-to-end
- Change: `playwright.config.ts` runs a **production** server on port 3100 (never
  3000, so a dev server keeps running) against `E2E_DATABASE_URL`, which must end
  in `_test`; `e2e/global-setup.ts` shells out to `e2e/seed.ts` via `tsx` because
  Playwright's CJS loader cannot import the ESM Prisma client; helpers use raw
  `pg` for fixtures and assertions for the same reason. Journeys: credentials
  sign-in, sign-out from the profile page, wrong-password rejection (3), and
  rewatch idempotency — two parallel POSTs with one `Idempotency-Key` produce one
  log, a second key produces a second, and an unauthenticated retry is 401 (3).
  `npm run test:e2e`; a CI job installs Chromium, migrates the e2e database, runs
  the journeys and uploads the report on failure.
- Migration: none.
- Verified: 6/6 journeys green locally (20.6 s), `tsc`, `eslint`, unit suite
  unchanged.
- Notes: `e2e/engagement.spec.ts` adds two journeys — rate a title (persisted
  across a reload) and post a review that mentions a neighbour, asserted through
  that neighbour's bell in a second browser context. Both failed at first for
  fixture reasons, not product reasons, and the fixes are worth remembering: a
  rating is written to `MovieTracking`, so a `Movie` row without a tracking row
  accepts the click and stores nothing; and the e2e database survives between
  runs, so a leftover rating hides the `Rate 4 of 5` button the journey starts
  from — the fixture now resets it. Still unwritten: add-a-movie from search.

## 2026-11-05 — WP-15 (finish) add-a-movie journey
- Change: `e2e/library-add.spec.ts` adds the last journey of the set — navigate to
  `/search?query=The Godfather`, click `Add title to library` on the TMDB id 238
  card, assert the "Added to your library" toast, reload and assert the card
  switched to "View in Library", then assert the `Movie` row exists in the e2e
  database. `e2e/helpers/db.ts` gained `forgetMovie` / `movieInLibrary`. The
  journey uses its own title because the engagement spec owns 550. It is the only
  TMDB-backed journey, so it skips with a named reason when no token is present;
  `playwright.config.ts` now imports `dotenv/config` so a local run reads `.env`
  the same way the server does, and CI supplies `DEMO_TMDB_TOKEN` from the
  `TMDB_ACCESS_TOKEN` secret plus `TMDB_BASE_URL`.
- Migration: none.
- Verified: 9/9 journeys green locally against `chronicle_e2e_test` (22.8 s). The
  one failure on the way was a locator bug, not a product bug: `getByLabel('Add
  title to library')` prefix-matched `Add title to library as completed`; the
  click needs `{ exact: true }`.
- Notes: the e2e job is new and unverified on GitHub until a push; the repo needs
  the `TMDB_ACCESS_TOKEN` secret or the search journey reports as skipped.

## 2026-11-05 — WP-13b undoable unwatch (10-minute window + purge)
- Change: every delete path (`removeRewatchLog`, `clearEpisodeWatchHistory`,
  `clearMovieWatchHistory`, `clearSeasonWatchHistory`, `clearShowWatchHistory`)
  now snapshots what it is about to destroy into `rewatch_log_removals` before it
  destroys it: the removed rows with their ids, group ids and timestamps, plus
  every episode/season/show/movie counter and the episode/show/movie tracking
  values the unwatch changes. `RemoveRewatchResult`/`RemoveRewatchActionResult`
  carry `undoToken`; `restoreWatchRemoval` + the `undoUnwatch` action replay the
  snapshot (byte-for-byte, original ids included) and consume it. Both toasts
  (`WatchActionModal`, `RewatchHistoryModal`) offer **Undo** through a new inline
  action on `AppToast` (`toastSuccess(message, title, action)`, 10 s). The server
  honours 10 minutes (`REWATCH_UNDO_WINDOW_MS`), refuses a second undo, refuses a
  removal older than the window, refuses another account's token, and refuses
  when the title's live log count no longer matches the count the removal left
  behind (`payload.remaining`, show-scoped for TV, movie-scoped for film) — the
  count comparison, not an existence check, so one row of a still-live season
  batch can still be undone. Expired snapshots
  are purged opportunistically on each new removal and by
  `GET /api/maintenance/rewatch-removals` (Bearer `CRON_SECRET`).
- Migration: `20261105190000_rewatch_log_removals` — new table
  `rewatch_log_removals` (`id`, `user_id`, `media_type`, `media_id`, `payload`
  jsonb, `created_at timestamptz(3)`), two indexes, FK to `User` cascade.
  Additive only; rollback is `DROP TABLE`. Proved on a dump-restored scratch
  database (`chronicle_undo_ck`, 400 existing logs untouched, `migrate diff`
  empty) before touching dev, then applied to dev, `chronicle_rewatch_test` and
  `chronicle_e2e_test`.
- Verified: 10 new integration tests (`undo.integration.test.ts`) — deep-equality
  of logs, counters and tracking before/after undo for movie, episode, season,
  show and a single history entry; undo twice, past the window, cross-account and
  after new activity all refused; both purge paths. 73/73 rewatch tests, 319 unit
  tests, `tsc`, `eslint`, build exit 0 on the advisory retry. Live on the dev
  server: unwatched Heartstopper Forever from the movie actions menu, toast read
  "Watch removed. / Undo", clicked Undo, pill returned to `Watch (1)`, and the
  row came back with the same id, group id, timestamp and tracking values
  (`COMPLETED`, rating 4, both timestamps) — `GET /api/maintenance/reconcile`
  then reported `checked: 295, drift: []`.
- Notes: **the plan said `rewatch_logs.deleted_at`; this ships a snapshot table
  instead.** A soft-deleted row cannot reproduce the tracking state the unwatch
  clears (movie/show status + timestamps), so the undo would be lossy, and every
  read of `rewatch_logs` — counters, history, reconcile — would have had to learn
  to filter tombstones. The snapshot keeps read paths untouched: removed watches
  are simply absent. The plan and gap-analysis now describe what shipped.

## 2026-11-05 — WP-17 rating in the details header
- Change: `notes/components/RatingControl` gained `variant: 'panel' | 'compact'`
  and now adopts its `value` prop when the page revalidates (scoped
  `eslint-disable-next-line react-hooks/set-state-in-effect`, because the rule's
  render-phase alternative cannot express "a prop arrives later"). The compact
  form renders in `LibraryDetailsHeader` for movies — replacing the read-only
  "Your Score" card, which only showed once a film was COMPLETED — and in the
  episode page header, both labelled per scope ("Rate this movie" / "Rate this
  episode") and both writing `setMediaRating`, so no new endpoint and no schema
  change. Shows stay unratable per D1; the label is what makes that read as a
  decision.
- Migration: none.
- Verified: 5 unit tests (`RatingControl.test.tsx`): write, clear via the filled
  star, compact label without the panel copy, prop adoption after the other copy
  writes, failed write reverts. 325 unit tests, `tsc`, `eslint`, build exit 0 on
  the advisory retry, 9/9 Playwright journeys. Live: header rating on a
  COMPLETED movie wrote 2, both copies showed 2/5, restored to 4 in the header;
  episode header wrote 5 and cleared it back to "Not rated", with the database
  left as found (movie rating 4, no stray episode tracking row).
- Notes: the Playwright rating journey had to be scoped to the header
  `role="group"` — "Rate 4 of 5" now matches twice on a movie page.

## 2026-11-05 — WP-18 the /notes index
- Change: new `src/app/(main)/notes/page.tsx` (session-gated with `redirect('/login')`,
  `force-dynamic`) lists every private note newest-first, with a GET search form and
  the shared `EmptyState` for both "no notes yet" and "no notes match". The service
  `notes/services/listNotesForUser({ userId, search })` filters `content` with
  `contains`/`insensitive`, orders by `created_at` desc, caps at `NOTE_PAGE_SIZE` (50,
  with a "+" on the badge) and resolves titles from the owner's own library in three
  batched reads instead of per-note lookups. `notes/lib/noteMediaTarget` turns a
  resolved title into its `/library` link and subtitle (Film / Series / "Show · S1E2");
  a note whose title left the library stays listed, unlinked, subtitled "No longer in
  your library". Timestamps render through a client `NoteTimestamp` so the server zone
  never reaches the UI. `shared/lib/navigation` gained the "Notes" tab.
- Migration: none.
- Verified: 9 new unit tests (4 on the target mapper, 5 on the service incl. the
  search filter, the unavailable-title case and "no media queries when there are no
  notes"). 334 unit tests, `tsc`, `eslint`, build exit 0 on the advisory retry, 9/9
  Playwright journeys. Live: `/notes` showed the user's one episode note as
  "Queen's Landing / House of the Dragon · S3E2 / 6 days ago", the nav tab appeared,
  `?q=queen` matched it, `?q=zzzzz` showed the search-empty state, the link opened the
  episode page, and `/notes` without a cookie redirected to `/login`.
- Notes: ordering is global `created_at desc`, which is the right UX but not the
  index's leading column; at personal scale (50 notes max) it is a small sort, and a
  `(user_id, created_at)` index is the follow-up if the page ever pages.

## 2026-11-05 — WP-20 demo reset: cron, variable, advisory lock
- Change: `reset-demo.yml` now runs `0 2 * * 1,4` (Monday and Thursday at 05:30
  IRST) instead of the single weekly `30 1 * * 5` that disagreed with its own
  comment; the URL comes from the `DEMO_RESET_URL` repository variable (named error
  when unset), the job has a `concurrency` group and a timeout, and a failed seed
  prints the response body so the failing titles are visible in the log.
  `GET /api/reset-demo` acquires `acquireAdvisoryLock(727214)` before doing anything
  destructive and returns 409 "A demo reset is already running." when another run
  holds it; the lock is released in a `finally`. New
  `infra/db/advisoryLock.ts` opens its own client (`createPrismaSession` in
  `infra/db/prisma.ts`) because `pg_advisory_lock` is session-scoped and Prisma's
  shared client is a pool — the lock and the unlock would land on different
  connections. The workflow treats 409 as "nothing to do". The login form already
  says the demo library is shared and resets periodically; nothing is
  session-scoped, so no copy changed.
- Migration: none.
- Verified: 3 integration tests on the lock (a second caller is refused while held,
  a lock held by another `pg` connection is seen, release is idempotent) — 3/3 pass
  against `chronicle_rewatch_test`. Live against a production build on port 3300
  with a temporary `CRON_SECRET`: 401 without a bearer, and 409 with the route's key
  held from a `psql` session. **Caveat, recorded honestly:** the first 409 probe hit
  a stale build (the running server predated the lock), so the request went through
  and re-seeded the demo account's library on the dev database — 5 movies and 5
  shows, which is exactly what the weekly job does. The probe was repeated after a
  rebuild and returned 409.
- Notes: 409 is deliberate, not 429 — it is a state conflict, and the caller (the
  workflow) should treat it as a no-op.

## 2026-11-05 — WP-19 moderation: report, hide, and tell the author why
- Change: schema migration `20261105210000_comment_moderation` adds
  `comments.hidden_at` / `comments.hidden_reason`, the `CommentReportReason` enum
  and `comment_reports` (comment, reporter, reason, note, resolved_at; unique per
  reporter+comment; cascade from comment and user). New
  `comments/actions/reportComment` (signed in, fixed reason list, optional 500-char
  note, one report per reader per review, never your own) and
  `comments/services/moderateComments` (`listModerationQueue` groups open reports
  per review; `applyModerationDecision` hides with the author-facing reason or
  dismisses, resolving every open report either way).
  `GET/POST /api/moderation/reports` is the token-gated operator surface (Bearer
  `CRON_SECRET`, 401/400/404 as appropriate). `listComments` now resolves the
  session viewer and filters `hiddenAt: null` for everyone except the author, who
  sees their review with `hiddenReason`; `CommentView` carries `hidden`/
  `hiddenReason`, and the feed renders the author's notice plus a flag button on
  other people's reviews that opens an inline report form.
- Migration: additive only (two nullable columns, one enum, one table). Proved on a
  dump-restored scratch database (`chronicle_mod_ck`: 12 comments and 5 users
  intact, no rows hidden, `migrate diff` empty), then applied to dev,
  `chronicle_rewatch_test` and `chronicle_e2e_test`.
- Verified: 13 new unit tests in `moderation.test.ts` (report validation and
  idempotency, queue grouping, hide/dismiss, viewer-aware visibility); 353 unit
  tests, `tsc`, `eslint`, build exit 0 on the advisory retry, 9/9 Playwright
  journeys. Live with two sessions: the reader reported another user's review
  through the new form (queue showed the reason, note and reporter), `POST hide`
  answered `{ ok: true, resolvedReports: 1 }`, the reader's feed no longer showed
  the review, the author's did with "Hidden from public view — Advertising a course
  in a review.", and the queue was empty afterwards. Probe rows were removed and the
  review unhidden, so dev data is back as it was.
- Notes: the operator surface is a token, not a role — the product has no moderator
  accounts yet, and inventing a role system was out of scope for a P2 package. A
  hidden review keeps its notifications and mentions; only the feed filters it.

## 2026-11-05 — WP-21 one write path for rewatch
- Change: `rewatch/lib/writeContract` is now the single parser/mapper for both
  adapters — `readRewatchWriteFields` (aliases `rewatched_at`/`rewatchedAt`/`date`
  and `client_request_id`/`clientRequestId`, plus the `Idempotency-Key` header),
  `parseRewatchWriteCommand` and `parseRewatchLogId` (media type, ids, log id), and
  `toRewatchFailure`/`toRewatchRemoveFailure` returning `{ message, status, code }`
  from one `AppError` mapping. `addRewatch`, `removeRewatch`,
  `POST /api/media/[type]/[id]/rewatch` and `DELETE /api/media/rewatch/[logId]` all
  go through it; the routes answer `{ ok: false, error, code }` with the mapped
  status instead of their own `apiError` copy.
- Migration: none.
- Verified: `writeContract.parity.test.ts` (6 tests) — the same fixture through the
  action and the route sends a deep-equal command to `recordRewatch`, every alias
  parses identically, one `NotFoundError` becomes the same message/code/status on
  both paths, invalid media type and empty log id are rejected with the same
  message before the service is called. Full suite 353 unit tests, `tsc`, `eslint`,
  build and 9/9 journeys green.
- Notes: `rewatch-history` (a read) was left alone — this package is about writes.

## 2026-11-05 — housekeeping: one component per file, no components in pages
- Change: the layout rule is now explicit in `SKILL.md` and
  `references/ui-conventions.md` — one component per file, component files hold
  nothing but the component (prop types in `types/`, constants in `constants.ts` or
  `lib/`), `page.tsx` defines no component of its own, and a component past ~200
  lines is split along its seams into sibling one-component files (the parent keeps
  state and callbacks). Violations found while
  applying it were fixed in the same pass: `PublicMediaPreview` moved out of
  `app/(main)/library/[...slug]/page.tsx` into
  `modules/library/components/details/PublicMediaPreview.tsx`; `CommentReportButton`
  split out of `CommentReportForm.tsx` (prop types in
  `comments/types/commentReport.ts`); `CommentSkeleton` extracted, and the review
  feed's page size, image limits and date/attachment helpers moved to
  `comments/constants.ts` and `comments/lib/commentFeedFormat.ts`;
  `RatingControlProps`/`NoteTimestampProps` moved to `notes/types/`, with
  `RATING_STARS` in `notes/constants.ts`.
- Migration: none.
- Verified: `tsc`, `eslint`, 354 unit tests, build on the advisory retry, 9/9
  Playwright journeys. No behaviour change intended or observed.
- Notes: seven component files still carry module-level constants (`MediaCommentTabs`
  tab maps, `PersonalNotesPanel` status labels, `CommentContent` default class,
  `NotificationBell` poll interval, `RewatchButton` long-press, `WatchActionModal`
  headings/nouns, `LibraryMediaDeleteButton` close delay). They are the next
  mechanical pass; the rule now applies to anything touched meanwhile.
- Also: the episode header's rating control (`b3e2c52`) reverted itself twice in the
  working tree during this session and was restored each time — worth checking for an
  editor buffer holding an older copy of that file.

## 2026-11-05 — docs: moderation follow-ups and open decisions
- Change: new `docs/moderation-audit.md` — the report flow as shipped (WP-19), seven
  findings with severity and file references (no actor on a decision, hide is
  one-way, dismissal blocks re-reporting, the author is never told, one report looks
  like five, the queue truncates at 50, dismissals leave no reason), six numbered
  product questions to answer inline, and six candidate packages (WP-24a…f) with
  their dependencies. `docs/remediation-plan.md` gained a Phase 4 section pointing at
  it (statuses stay "planned"), and `docs/gap-analysis.md` C2 links to it.
- Migration: none.
- Verified: documentation only; `tsc`, `eslint`, unit suite unchanged from the last
  green run.
- Notes: WP-24a (recording the decision) needs no product answer and is the obvious
  first slice; WP-24b (unhide) is the one that removes the only unrecoverable click.
  The `Notification` actor/unique constraints are written down in the audit because
  "tell the author" is a schema decision, not a copy change.

## 2026-11-05 — episode page: drop the header rating control
- Change: the episode page's meta row no longer renders `RatingControl` (or the
  read-only `x / 5` badge). Its rating stays in the Personal Notes tab, where it
  already lived and where the same `setMediaRating` action is wired. The movie
  details header keeps its compact control. Unused `RatingControl`/`IconStar`
  imports removed. Plan, gap-analysis and SKILL.md now describe the movie header as
  the only header placement.
- Migration: none.
- Verified: `tsc`, `eslint`, 354 unit tests, build, 9/9 Playwright journeys.
- Notes: `e2e/engagement.spec.ts` is unaffected — its rating journey targets the
  movie page's header group.

## 2026-11-05 — docs: architecture audit (WP-25…WP-32 proposed)
- Change: new `docs/architecture-audit.md` — a measured audit rather than a proposal to
  restructure. Method: import graph over 573 source files, `tsc` with seven extra strict
  flags, `.next` chunk sizes, route table. Ten findings (F1–F10) with file evidence, a
  target tree, and the guardrail code (layering + module cycles) to enforce it.
  Headlines: the module graph is a single 18-node cycle with 14 `shared`→feature and 2
  `infra`→feature imports; 1.1 MB client JS with zero `dynamic()`; `any` is already absent
  but `verbatimModuleSyntax`/`noUncheckedIndexedAccess`/`exactOptionalPropertyTypes` would
  report 397 errors (197/135/43); 27 files read `process.env` with no schema; every route
  is dynamic and caching is the previous Next 16 model.
- Migration: none.
- Verified: read-only (no source changes). Numbers are reproducible with the commands in
  the audit's method section.
- Notes: the four `system:*` skills the brief asked for do not exist in this environment —
  the audit says so and uses `chronicle`, `src/architecture.test.ts` and measurements
  instead. The audit explicitly rules out a directory reshuffle, TanStack Query and a
  global state library, with reasons. `docs/remediation-plan.md` gained Phase 5
  (WP-25…WP-32, all "planned") and `docs/gap-analysis.md` a pointer, so the severity list
  stays behavioural.

## 2026-11-05 — WP-25 · Layering: cut shared→feature edges, guard the direction
- Change: the bottom of the stack no longer imports features.
  `shared/ui/{trending,upcoming}/*` (9 files) and the four list components that
  used them (`TrendingMovieList`, `TrendingShowList`, `UpcomingMovieList`,
  `UpcomingEpisodeList`) moved to `modules/dashboard/components/{trending,upcoming}/`
  and are exported from `modules/dashboard`; `shared/lib/computeWatchStats` →
  `modules/dashboard/lib/watchStats`. App chrome (`Header`, `HeaderActions`,
  `HeaderNav`, `Footer`, `types/header`) moved from `shared/ui` to `app/_components/`
  because it composes the notification bell. `modules/api` dissolved:
  `lib/respond` + `types` + `shared/lib/httpErrorMap` → `infra/http/`,
  `services/auth` → `infra/auth/apiSession`. `modules/user/actions/ensureUsername`
  → `infra/auth/ensureUsername`, and the username helpers it needs
  (`modules/user/lib/username` + test) → `shared/lib/username`.
  `library/types/getUpcomingMedia` → `shared/types/getUpcomingMedia` so movie and
  episode-season stop importing library for a one-field type.
- Guardrails: `src/architecture.test.ts` gained three rules — `shared/` imports no
  feature, `infra/` imports no feature and no `shared/ui`, and feature→feature
  imports are a 31-pair snapshot that fails on any addition (three two-way pairs are
  named for unwinding: library↔discovery, comments↔notes, show↔episode-season).
- Migration: none.
- Verified: tsc, eslint, 357 unit tests (3 new guardrail tests), build compiled on the
  advisory retry with no compile/type errors.

## 2026-11-05 — WP-26 · Interaction-only client surfaces are lazy
- Change: `next/dynamic` (`ssr: false`) for the components that only mount after a
  click — `WatchActionModal` (all four entry points: `RewatchButton`,
  `ShowDetailsEpisodeCardToggleButton`, `LibraryDetailsSeasonActions`,
  `LibraryDetailsShowWatchToggle`), `RewatchHistoryModal` (`RewatchButton`,
  `RewatchHistoryButton`) and `CommentReportForm` (`PublicReviewsPanel`). The bell
  stays eager on purpose: its unread badge is part of the first paint.
- Measured: `.next/static/chunks` still totals 1.1 MB (the code did not shrink, it
  moved), but the eager 168 KB chunk is gone and a lazy 132 KB chunk appeared; the
  modal code is no longer in the title page's initial graph.
- Migration: none.
- Verified: tsc, eslint, 357 unit tests (one test now awaits the lazily imported
  dialog), build compiled on the advisory retry, 9/9 Playwright journeys — the
  dialogs still open and log watches after being split out.

## 2026-11-05 — WP-27 · Type-only imports are explicit; the compiler is stricter
- Change: `tsconfig.json` now has `verbatimModuleSyntax`, `noUnusedLocals`,
  `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, and
  `target: ES2022`; `allowJs` removed (there is no JS in `src/`). The 197 type-only
  imports were rewritten mechanically with `@typescript-eslint/consistent-type-imports
  --fix` (134 files, `import type` only — no behaviour), then four residuals fixed by
  hand: two unused `import React`, an unused `tmdbId` parameter on
  `notifications/lib/notificationHrefs.reviewsTab` (call sites updated), and
  `AppError.cause` now declares `override`.
- Migration: none.
- Verified: tsc clean with the new flags (from 397 errors down to 0), eslint clean,
  357 unit tests, build compiled on the advisory retry, 9/9 Playwright journeys — the
  value-import → type-import rewrite did not drop any runtime dependency.

## 2026-11-05 — WP-28 · Caching: decision recorded, no migration
- Change: D5 added to the plan's decisions table — stay on `unstable_cache` +
  `revalidateTag`, do not adopt `cacheComponents` yet. No code change.
- Why: `app/(main)/layout.tsx` awaits `auth()`, so every route under it is dynamic by
  construction; route-level `revalidate`/`generateStaticParams` cannot take effect, and
  the public title pages read per-user tracked flags anyway. `use cache` would fix the
  coarse `media` tag (the reason `docs/architecture-audit.md` F7 exists) but changes
  prerender semantics for all 26 routes and needs its own proof budget.
- Migration: none.
- Verified: reasoning checked against the route table (all `ƒ` except the four static
  generated files) and the layout source; no behaviour change to verify beyond the
  gates, which were re-run with WP-27.

## 2026-11-05 — WP-29 · One door for configuration
- Change: new `src/infra/env.ts` (server) and `src/shared/lib/publicEnv.ts` (client-safe)
  own every environment read; the 20 production call sites moved onto them —
  auth (`AUTH_SECRET`, Google, guest login, demo email), TMDB (`TMDB_BASE_URL`,
  token/`DEMO_TMDB_TOKEN`), storage (`COMMENT_STORAGE_DIR`, `S3_PUBLIC_BASE_URL`),
  Prisma (`DATABASE_URL`, `DEMO_DATABASE_URL`, `PRISMA_TARGET`, build phase), the four
  operator routes (`CRON_SECRET`), robots/sitemap/share (`NEXT_PUBLIC_APP_URL`) and the
  poster CDN chain. Getters, not frozen constants, so suites that assign `process.env`
  after import still work; `DATABASE_URL`/`AUTH_SECRET` throw with the variable name,
  everything optional stays optional.
- Two deliberate exceptions, both documented in place: `infra/http/securityHeaders.ts`
  keeps direct reads (next.config imports it by relative path and cannot resolve `@/`),
  and `infra/env.ts` carries no `import 'server-only'` because `tsx` scripts
  (`e2e/seed.ts`) execute it — Next only inlines `NEXT_PUBLIC_*`, so nothing leaks.
- Guardrails: `src/architecture.test.ts` now fails if any file outside the two env
  modules (tests excluded) reads `process.env`, and if a `'use client'` file imports
  `@/infra/env`.
- Migration: none.
- Verified: tsc, eslint, 358 unit tests (2 new guardrails), build compiled on the
  advisory retry, 9/9 Playwright journeys — login, TMDB-backed dashboard, live TMDB
  library add, storage and the token-gated routes all resolved through the new module.
- Note: the first E2E run after this change caught the `server-only` marker throwing in
  `tsx` (`e2e/seed.ts`) and in the server build; that is why the module has no marker.

## 2026-11-05 — WP-30 · One validation contract at the request boundaries
- Change: `src/shared/lib/parse.ts` defines `ParseResult<T>` (`{ ok, value }` /
  `{ ok, error }`) plus the primitives (`isRecord`, `parseString`, `parseOptionalString`,
  `parseOneOf`, `readJsonBody`) — no new dependency; `rewatch/lib/writeContract` already
  followed this shape, so writes and reads now agree. The two hand-rolled handlers moved
  onto it: `comments/lib/parseModerationDecision` (body of the moderation POST) and
  `user/lib/parseUserSearchQuery` (`?q=` length + charset). Both routes are now
  `parse → 400 on !ok` with no `as` cast and no rules inline.
- Behaviour: the moderation 400 used to say "Expected { commentId, action … }" for every
  failure; it now names the offending field. Same status codes, same success payloads.
- Migration: none.
- Verified: tsc, eslint, 367 unit tests (8 new for the two parsers), build compiled on
  the advisory retry.
- Notes: `comments/lib/validation.ts` (comment body/attachments) and
  `rewatch/lib/writeContract` keep their own parsers — they already reject on the same
  shape and are covered by their own suites; retyping them would be churn without a
  behavioural gain.

## 2026-11-05 — WP-31 · `noUncheckedIndexedAccess` on
- Change: `noUncheckedIndexedAccess` enabled. 153 errors at the flag's introduction
  (27 files): ~50 in production code and the rest in suites/fixtures.
  Production fixes are real guards, not assertions — `mentions`/`tokenizeMentions`
  read the fence/closing/handle regex groups with `?.[1]` and skip when absent,
  `CommentImageGrid` derives its first image and returns null without one,
  `LibraryDetailsSeasons` returns null when a show has no seasons,
  `LibraryShowProgress` falls back to null for an unknown headline, the upcoming lists
  skip an episode-less entry, `reset-demo`/`seed` `randomFrom`/`shuffle` refuse an empty
  list instead of returning `undefined`, and the poster gradient falls back to the
  neutral token. `!` is used only in tests and in the fixture guard.
  `src/modules/rewatch/__fixtures__/rewatchFixture` now asserts its shape once (two
  seasons, three + one episodes), which removed 70 downstream errors at the source.
- Migration: none.
- Verified: tsc clean under the flag, eslint clean, 367 unit tests, 82 rewatch
  integration tests against `chronicle_rewatch_test`, build compiled on the advisory
  retry, 9/9 Playwright journeys.
- Notes: `exactOptionalPropertyTypes` stays off — it is the remaining strictness item
  (43 errors when measured, mostly component props passed as `undefined`); enabling it
  is a separate pass with its own review, recorded in the plan as WP-31b.

## 2026-11-05 — WP-32 · Barrel and test-placement policy, and Phase 5 close-out
- Change: barrels (`modules/*/index.ts`) are now only a module's own public surface —
  `modules/user/index.ts` stopped re-exporting `shared/lib/username` (a leftover from
  WP-25), and two guardrails were added: a barrel may only re-export from its own
  module, and nothing may import `@/modules/<x>/index` by file path. Test placement is
  documented rather than moved: suites live beside the code they cover, and a route
  handler's suite sits beside the route (`app/api/users/search/route.test.ts`), which is
  the only such case and is now the stated rule.
- `docs/architecture-audit.md` closes with a resolution table for F1–F10.
- Migration: none.
- Verified: tsc, eslint, 369 unit tests (14 architecture guardrails in total), build on
  the advisory retry, 9/9 Playwright journeys.
