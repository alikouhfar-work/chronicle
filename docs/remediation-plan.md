# Chronicle — remediation plan

Derived from `docs/gap-analysis.md` (26 findings: 5 P0, 13 P1, 18 P2). This file turns
every recommendation into an executable work package: scope, files, migration, tests,
acceptance criteria, effort, and what it blocks.

Ground rules for every package:

1. Ships green — `tsc`, `eslint`, `npm test`, `npm run build` (the advisory gate needs
   the retry, as always).
2. Migrations are proved on a scratch database first (`createdb chronicle_<name>_ck`,
   `migrate deploy`, inspect, then apply to dev). Never `migrate dev` — the chain has a
   historical edited migration.
3. Behaviour changes come with a test that fails without them.
4. No package starts before the ones it depends on are merged.

Work packages are ordered so that safety nets land before risky changes.

---

## Phase map

```
Phase 0 — safety net (no product change)
  WP-01 cascade + concurrency tests ─┐
  WP-02 CI gates ────────────────────┼─► unlocks every migration below
  WP-03 structured logging ──────────┘

Phase 1 — P0 (stop the bleeding)
  WP-04 rewatch group identity   ◄── needs WP-01
  WP-05 upload hardening              (independent)
  WP-06 security headers              (independent)
  WP-07 attachment quota + GC    ◄── needs WP-05 (sniffed keys), WP-03
  WP-23 hard-delete comments + attachments ◄── needs WP-07 (storage delete)
  WP-08 rewatch idempotency      ◄── needs WP-04 (same table, one migration cycle)

Phase 2 — P1 (correctness and scale)
  WP-09 reply notifications + mention cap
  WP-10 timestamptz migration         (independent, do before WP-11 caching)
  WP-11 caching + tag invalidation ◄── needs WP-10 (stable instants)
  WP-12 bell polling
  WP-13 unwatch safety + log editing ◄── needs WP-04
  WP-14 reconciliation job        ◄── needs WP-03
  WP-15 Playwright journeys       ◄── needs WP-02
  WP-16 season-rule affordance

Phase 3 — P2 (product and maintenance)
  WP-17 rating placement (+ decision gate D1)
  WP-18 /notes index
  WP-19 moderation (+ decision gate D2)
  WP-20 demo/cron/env hardening
  WP-21 API/action contract dedupe
  WP-22 grouped season recompute
```

Parallel tracks: **A** storage & security (WP-05→07), **B** rewatch integrity
(WP-01→04→08→13), **C** time & caching (WP-10→11→12), **D** product surface
(WP-16→17→18→19). Tracks touch different modules and can run concurrently after
Phase 0.

---

## Decisions (answered by the product owner in `docs/gap-analysis.md` §Open questions)

| Gate | Question | Answer | Consequence for this plan |
|------|----------|--------|---------------------------|
| D1 | Are shows/seasons ratable? | **No — episode and film only, for now.** | B1 closed as intended. WP-17 keeps only the header placement; no `ShowTracking.rating` / `Season.rating` columns. The UI should say "rate this episode/movie" so the scope reads as deliberate. |
| D2 | Do reviews thread? | **Flat feed for now.** | C1 closed as an accepted limitation: mentions remain the only notification trigger, so WP-09 shrinks to the mention cap and no `COMMENT_REPLY` enum value is added. `NotificationType` stays single-valued. |
| D3 | Demo model? | **One shared account for visitors.** | WP-20 keeps the shared account; it only fixes the cron expression, adds a reset lock, and moves the URL to a repo variable. No session-scoped libraries. |
| D4 | Attachment retention after delete? | **No soft delete — deleting a comment removes it and its attachments permanently.** | `Comment.deletedAt` goes away, `deleteComment` becomes a hard delete that removes attachment rows and storage objects in the same request, and the notification rows for that comment cascade with it. WP-07's sweep loses its retention branch and becomes a backstop for abandoned uploads only; new WP-23 owns the delete path. |

Two consequences worth confirming, since they are user-visible:

- Hard-deleting a comment also deletes the `Notification` rows pointing at it
  (`onDelete: Cascade`), so a mentionee's bell entry disappears instead of showing
  "this review was deleted". That matches "gone forever"; the snapshot columns stay
  useful for media that leaves a library, not for deleted comments.
- An attachment whose object delete fails blocks nothing — the row goes with the
  comment, the orphan sweep (WP-07) removes the object on its next pass.

---

# Phase 0 — safety net

## WP-01 · Rewatch cascade and concurrency tests — **done**
**Covers:** A1 (precondition), G1.
**Why first:** every later rewatch change needs a failing test to prove it.

- Extend `src/modules/rewatch/rewatch.integration.test.ts` with a concurrency
  harness: run two `recordRewatch` calls with a fixed `rewatchedAt`, then delete one
  and assert the sibling's logs survive.
- New `src/modules/rewatch/cascade.integration.test.ts`: season batch + an unrelated
  single-episode log in the same millisecond; delete the season log; assert the single
  log survives (this test fails today — mark it `it.fails` until WP-04).
- Fixture helper extracted to `src/modules/rewatch/__fixtures__/rewatchFixture.ts`.

**Acceptance:** suite runs against a real Postgres, documents the current bug with a
red test, and passes after WP-04 with no test edits.
**Effort:** 1 day.

## WP-02 · CI gates — **done**
**Covers:** G3, and protects every migration.

- `.github/workflows/ci.yml`: Node 22, Postgres 17 service, `npm ci`, `tsc`, `lint`,
  `npm test`, `migrate deploy` on the service DB, integration suite,
  `prisma migrate diff --from-migrations --to-schema` must be empty, `next build`.
- Cache `~/.npm` and Prisma engines; fail the job on any step.

**Acceptance:** a deliberately broken migration and a schema change without its
migration both fail CI.
**Effort:** 0.5 day.

## WP-03 · Structured logging — **done**
**Covers:** G2; makes WP-07/WP-11 measurable.

- `src/infra/logging/logger.ts` + `types.ts`: `logEvent({ level, event, route, action,
  userId?, digest?, error? })` emitting one JSON line; never logs comment text,
  emails, or tokens.
- Replace the 21 `console.error` call sites; `ErrorState` shows the digest that
  matches the log line.
- `src/infra/logging/logger.test.ts` asserting redaction.

**Acceptance:** one line per handled failure, no PII, digest correlates with the UI.
**Effort:** 1 day.

---

# Phase 1 — P0

## WP-04 · Give cascade groups an identity — **done**
**Covers:** A1.

- Migration `20261105xxxxxx_rewatch_group_id`:
  - `ALTER TABLE rewatch_logs ADD COLUMN group_id uuid;` + `CREATE INDEX ... (group_id);`
  - Backfill: for each season/show log, set its own `group_id = id` and adopt matching
    children `(user_id, media_type='episode', season_id/show_id, rewatched_at)`; any
    remaining log gets `group_id = id`.
  - Keep the timestamp columns for history/reporting; they stop being an identity.
- `rewatchService.ts`: `updateRewatchCounters`/cascade paths set `groupId` on every
  child; `removeRewatchLog` deletes `where: { groupId }` (still scoped by `userId`).
- Schema: `groupId String? @map("group_id")`, `@@index([groupId])`.

**Acceptance:** WP-01 concurrency and same-millisecond tests pass; backfill leaves zero
logs with a null `group_id`; deletion of one batch leaves sibling batches intact.
**Risk:** low (additive column, nullable, backfill idempotent).
**Effort:** 1.5 days.

## WP-05 · Upload hardening — **done**
**Covers:** D1, D2.

- `upload/route.ts`: reject on `Content-Length` > limit with 413 before reading; read the
  body through a capped transform (`MAX + 1` bytes) and abort past the cap.
- Magic-byte sniffing (`src/modules/comments/lib/sniffImageType.ts`, no new dependency —
  JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF....WEBP`); reject mismatches with 415;
  derive the stored `contentType` and key extension from the sniff, never the request.
- `files/[...key]` and the upload response add `X-Content-Type-Options: nosniff`.
- Tests: 6 MB body → 413 without full read; HTML bytes labelled `image/png` → 415;
  valid PNG → 200 and stored type `image/png`.

**Acceptance:** the three tests above pass; no `arrayBuffer()` of an unbounded body.
**Effort:** 1.5 days.

## WP-06 · Security headers — **done**
**Covers:** D3.

- `next.config.ts` `headers()` for all routes: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off),
  `Strict-Transport-Security` in production.
- CSP in report-only first: `default-src 'self'`, `img-src 'self' data: blob:
  https://image.tmdb.org <storage origin>`, `script-src 'self' 'unsafe-inline'` initially
  (Next inline bootstrap), tighten to nonce in a follow-up once reports are clean.
- Test: a unit test asserting the header object, plus a browser check on `/login`.

**Acceptance:** headers present on a static page, an authenticated page, and the upload
route; CSP violations are reported but nothing breaks.
**Effort:** 1 day.

## WP-07 · Attachment quota and garbage collection — **done**
**Covers:** D4, D5, D6.

- Schema: `CommentAttachment.storageKey String @unique @map("storage_key")` (backfill from
  the existing URL suffix; every URL today is minted server-side).
- `StorageProvider` gains `list(prefix): Promise<string[]>` and `delete(key)`; implement
  for S3 (`ListObjectsV2`, `DeleteObject`) and the local provider.
- `src/app/api/maintenance/attachments/route.ts` (Bearer `CRON_SECRET`, same pattern as
  `reset-demo`): objects under `comment-attachments/` with no row and `LastModified`
  older than 24 h → delete. This is now only a backstop for abandoned uploads (D4
  removed the retention branch — deletes are immediate, see WP-23).
- Upload quota: reject when the user's total attachment bytes exceed
  `COMMENT_USER_QUOTA_BYTES` (default 250 MB) or when > 40 uploads happen in 24 h.
- `storage.ts`: throw at module load when `NODE_ENV=production` and no bucket is
  configured (D6), with the missing variable named.
- Tests: local provider list/delete round trip; sweep logic with an in-memory provider;
  quota rejection.

**Acceptance:** a sweep run removes an abandoned object and leaves attached ones; quota
returns 413/429 with a clear message; production without S3 fails fast.
**Risk:** deletion is destructive — the sweep only touches rows/objects with no live
reference and a 24 h grace period.
**Effort:** 2.5 days.

## WP-23 · Hard-delete comments and their attachments — **done**
**Covers:** D4 (delete means delete) and the removal half of C2.
**Depends on:** WP-07 (storage `delete`, `storage_key`).

- Schema: drop `Comment.deletedAt`; `Notification.commentId` and `CommentMention.commentId`
  already cascade, so their rows go with the comment.
- Migration: hard-delete any existing soft-deleted comments first (attachments' objects are
  collected in app code before the drop; anything missed is picked up by the WP-07 sweep),
  then `ALTER TABLE comments DROP COLUMN deleted_at;`.
- `deleteComment`: one transaction — collect attachment keys, delete the comment row (cascade
  removes mentions, notifications, attachments), then best-effort `storage.delete` for each
  key outside the transaction. A failed object delete logs and defers to the sweep; the row
  removal is never rolled back for it.
- `listComments`, `attachNotificationHrefs` (`commentAvailable` now means the row exists),
  `MediaCommentTabs`/`PublicReviewsPanel`: drop the "this review was deleted" branch; the
  `?mention=unavailable` notice stays for media that left every library.
- Tests: deleting a comment removes its rows, its notification, its mentions, and calls
  storage delete once per attachment; a second delete reports "not found"; another user's
  comment is untouched; the notification bell no longer lists it.

**Acceptance:** no `deleted_at` column, no soft-delete branch anywhere, objects removed on
delete (sweep is backstop only), and the bell shows no dead entries.
**Risk:** destructive by definition — purge step runs only against rows already marked
deleted, and the pre-migration dump is kept until verified.
**Effort:** 1.5 days.

## WP-08 · Idempotent rewatch — **done**
**Covers:** A2.

- Schema (same migration as WP-04): `clientRequestId String? @map("client_request_id")`,
  `@@unique([userId, clientRequestId])`.
- `addRewatch(mediaType, mediaId, clientRequestId?)`: on unique violation return the
  current count as success. `WatchActionModal` and `RewatchHistoryModal` mint a uuid per
  dialog open; `POST /api/media/[type]/[id]/rewatch` accepts `Idempotency-Key`.
- Tests: same key twice → one log, identical count; distinct keys → two logs.

**Acceptance:** replaying the action never duplicates a watch.
**Effort:** 1 day.

---

# Phase 2 — P1

## WP-09 · Mention cap (C1 closed by D2) — **done**
**Covers:** C3. C1 is an accepted limitation: the feed stays flat and mentions remain
the only notification trigger, so no `COMMENT_REPLY` value is added.

- `createComment`: cap mentions at `COMMENT_MAX_MENTIONS = 10`, rejected before any
  write with a clear error; the composer shows the remaining allowance.
- Tests: 11 handles rejected with nothing written; 10 handles create exactly 10
  notifications; self-mentions still create none.

**Effort:** 0.5 day.

## WP-10 · Timestamptz migration — **done**
**Covers:** F3.

- 40 columns move to `@db.Timestamptz(3)` in `schema.prisma`; the migration converts with
  an explicit zone (`USING col AT TIME ZONE 'UTC'` — confirm the deployment's current
  assumption from `pg_settings TimeZone` on the target host first).
- Application stays on epoch milliseconds (`new Date()`), so no logic change; date
  formatting moves to the client for locale/timezone correctness.
- Prove on a dump-restored scratch database: row counts identical, no value shifted
  more than the documented offset.

**Acceptance:** upcoming/up-next windows are stable regardless of `TZ`; integration
tests around a DST boundary pass; no `timestamp without time zone` left.
**Risk:** highest in the plan — rehearse on a dump, keep the pre-migration dump until
verified.
**Effort:** 2 days.

## WP-11 · Cache the non-user fragments — **done (coarse tags)**
**Covers:** E1, E2.

- Tag TMDB-derived reads (`trending`, `similar`, `credits`, genre dictionary) with
  `unstable_cache`/`"use cache"` and tags `media:<type>:<tmdbId>`, `trending:<type>`.
- Keep user-owned reads dynamic; `force-dynamic` stays only where a per-user RLS-style
  read requires it (details/episode/profile).
- Writes call `revalidateTag('media:movie:550')` and `revalidateTag('library:<userId>')`;
  `revalidateMediaDetail` stops passing concrete paths under the catch-all route.
- Measure with WP-03 logs: DB reads per navigation before/after.

**Acceptance:** a cached detail page issues zero TMDB-associated DB reads on repeat
navigation; a rating change invalidates exactly the affected tags; page data is never
stale for longer than one request after a write.
**Effort:** 2.5 days.

## WP-12 · Bell polling — **done**
**Covers:** E4.

- Merge the mount and pathname effects into one; skip the interval when
  `document.visibilityState === 'hidden'`; refresh once on `visibilitychange → visible`.
- Serve the count backed by a cache tag invalidated when a notification is created.
- Test with fake timers + a visibility mock: hidden tab → 0 polls in 5 minutes.

**Effort:** 0.5 day.

## WP-13 · Unwatch safety and log editing — **done** (WP-13b: undo window + purge)
**Covers:** A3, A4.

- `WatchActionModal` shows the destructive count for show/season unwatch.
- `rewatch_log_removals` (migration `20261105190000_rewatch_log_removals`): every
  delete path snapshots the rows it removes **and** the episode/season/show/movie
  counters and tracking values it changes; the toast offers Undo for the payload's
  life, and the server honours a 10-minute window.
- `restoreWatchRemoval({ userId, removalId })` → `undoUnwatch` action replays the
  snapshot (log ids and group ids included) and deletes it, so a second undo reads
  as missing. It refuses once the title's live log count no longer matches the
  count the removal left behind, and
  `GET /api/maintenance/rewatch-removals` (Bearer `CRON_SECRET`) plus an
  opportunistic sweep on each new removal purge closed windows.
- `updateRewatchLog({ logId, rewatchedAt })` action + date field in `RewatchHistoryModal`.
- Tests: unwatch → undo restores logs, counters, watched flags and tracking
  timestamps byte-for-byte for movie/episode/season/show and for a single
  history entry; undo twice, past the window, cross-account, and after new
  activity are all refused; purge removes expired snapshots only.

**Effort:** 2 days.

## WP-14 · Reconciliation job — **done**
**Covers:** F1.

- `src/app/api/maintenance/reconcile/route.ts` (token-gated): report mode by default,
  `?fix=1` to repair. Checks: `rewatch_count` vs logs for the four tables, the season
  rule, and `Show.numberOfEpisodes` drift as informational only.
- Integration test that injects drift, asserts the report, then fixes and re-asserts.

**Effort:** 1 day.

## WP-15 · Playwright journeys — **done** (harness + 9 journeys, add-movie included)
**Covers:** G1.

- `playwright.config.ts`, `e2e/` specs against a seeded DB, run in the CI workflow:
  sign in (credentials), add a movie, mark watched → rewatch dialog, rate it, post a
  review with an attachment, mention a user and see the notification.
- Concurrency spec: two tabs log the same rewatch with one idempotency key.
- The add-a-movie journey is the only live-TMDB one; it skips with a named reason
  unless `DEMO_TMDB_TOKEN` is set (CI wires it from the `TMDB_ACCESS_TOKEN`
  repository secret), so a token-less checkout still gets a green suite.

**Acceptance:** nine journeys green locally (and in CI once the TMDB secret is
set); the suite documents the intended UX, not the current quirks.
**Effort:** 2.5 days.

## WP-16 · Season-rule affordance — **done**
**Covers:** A5.

- `computeSeasonRewatchCount` returns `{ count, lowestWatches, episodesBelowBaseline }`;
  the season header shows "Season rewatch unlocks at 4 watches per episode — 2 short".
- Unit tests for the shortfall numbers at each threshold step.

**Effort:** 0.5 day.

## WP-22 · Grouped season recompute — **done**
**Covers:** F2.

- One grouped query for all seasons of a show; `updateMany` per distinct value instead of
  a per-season round trip inside `syncSeasonRewatchCount`.
- Integration test: show rewatch produces identical counters with one query per show.

**Effort:** 1 day.

---

# Phase 3 — P2

## WP-17 · Rating placement (D1: episode and film only) — **done**
**Covers:** B2. B1 is closed as intended — no `ShowTracking.rating` / `Season.rating`.

- `RatingControl` gained `variant: 'panel' | 'compact'`. The compact form sits in the
  movie details header (replacing the read-only "Your Score" card, which only appeared
  for completed films), labelled "Rate this movie" with the same `setMediaRating`
  action — no new endpoint, no new schema. The episode page has no header control: its
  rating stays in the Personal Notes tab.
- The panel copy in the notes tab stays, and the control now adopts a value written by
  the other copy once the server revalidates the page.
- Tests: 5 unit tests on the control (write, clear, compact label, prop adoption, failed
  write reverts); the Playwright rating journey clicks the header group, which also
  proves the placement, and had to be scoped because "Rate 4 of 5" now matches twice.

**Effort:** 0.5 day.

## WP-18 · `/notes` index — **done**
**Covers:** B3.

- `src/app/(main)/notes/page.tsx` (session-gated, `force-dynamic`) renders every private
  note newest-first with a GET search form; `notes/services/listNotesForUser({ userId,
  search })` filters `content` case-insensitively and resolves each title from the
  viewer's own library in three batched reads (films, shows, episodes).
- `notes/lib/noteMediaTarget` maps a resolved title to its `/library` link and subtitle
  ("Film", "Series", "House of the Dragon · S3E2"); a note whose title left the library
  stays listed with no link and the subtitle "No longer in your library".
- Nav entry "Notes" (`shared/lib/navigation`); empty state and "no results" state both
  use the shared `EmptyState`; timestamps render client-side via `NoteTimestamp` so the
  server timezone never leaks into a user-visible date.

**Effort:** 1 day.

## WP-19 · Moderation surface (gate D2) — **done**
**Covers:** C2.

- Schema (migration `20261105210000_comment_moderation`): `comments.hidden_at` +
  `hidden_reason`, `CommentReportReason` enum, and `comment_reports`
  (`comment_id`, `reporter_id`, `reason`, `note`, `resolved_at`, unique per
  reporter+comment, cascade from comment and user).
- `reportComment` action: signed-in, one report per reader per review (a repeat is
  a success with `alreadyReported`), never on your own review, never on media you
  cannot see, reason from a fixed list plus an optional 500-char note.
- `listComments` filters `hiddenAt: null` for everyone **except the author**, who
  keeps seeing the review with `hiddenReason`; the feed renders that as a notice.
  `CommentView` carries `hidden`/`hiddenReason`.
- `GET/POST /api/moderation/reports` (Bearer `CRON_SECRET`): the queue grouped per
  review, and `hide`/`dismiss`. Hiding stores the author-facing reason and resolves
  every open report; dismissing clears the queue and leaves the review up.
- UI: a flag on other people's reviews opens an inline form (reason + note); the
  author sees "Hidden from public view — <reason>" on their own hidden review.

**Effort:** 2 days.

## WP-20 · Demo, cron and env hardening (D3: shared account confirmed) — **done**
**Covers:** F5, D6. F4 is accepted: one shared visitor account.

- `reset-demo.yml`: cron is now `0 2 * * 1,4` (Monday and Thursday, 05:30 IRST) and
  the comment no longer promises something else; the target URL comes from the
  `DEMO_RESET_URL` repository variable with a named error when it is unset; the job
  has its own `concurrency` group, a timeout, and prints the response body so a
  failed seed lists the failing titles.
- `GET /api/reset-demo` takes a Postgres advisory lock
  (`infra/db/advisoryLock.acquireAdvisoryLock`, dedicated client because the lock is
  session-scoped and Prisma pools connections) and answers 409 while another reset
  holds it; the workflow treats 409 as "nothing to do", not a failure.
- The demo copy already says "Shared demo library on its own database. Resets
  periodically." on the login form; nothing is session-scoped, so no change.

**Effort:** 0.5 day.

## WP-21 · One write path per operation — **done**
**Covers:** E3.

- `rewatch/lib/writeContract`: `readRewatchWriteFields` (the documented body aliases
  plus `Idempotency-Key`), `parseRewatchWriteCommand` / `parseRewatchLogId`, and
  `toRewatchFailure` / `toRewatchRemoveFailure` (message + status + code from
  `AppError`). The service stays the only implementation; both adapters are thin.
- Used by `addRewatch`, `removeRewatch`, `POST /api/media/[type]/[id]/rewatch` and
  `DELETE /api/media/rewatch/[logId]` — the routes now answer with the same
  `{ ok, error, code }` + status the action's message describes.
- Contract test (`writeContract.parity.test.ts`): the same fixture through the
  action and the route reaches the service with a deep-equal command, every alias
  parses the same, one failure maps to the same message/code/status on both paths,
  and invalid input is rejected before the service is touched.

**Effort:** 1 day.

---

# Phase 4 — moderation follow-ups (planned; decisions in `docs/moderation-audit.md`)

WP-19 shipped the queue and the hide flag, but left the operational gaps open:
nothing records **who** decided, a hide cannot be undone, a dismissed review can
never be reported again, and the author is never told. The full analysis and the
questions to answer are in `docs/moderation-audit.md`; these packages stay
unstarted until those answers exist.

## WP-24a · Record the decision
- `comment_reports.resolved_by` / `decision` / `decision_reason`; the queue exposes
  the last decision per review. No product decision needed — safe to build first.

## WP-24b · Unhide
- `action: "unhide"` clears `hidden_at`/`hidden_reason`, revalidates, records the
  decision. Reverses the only irreversible button in the feature.

## WP-24c · Re-report after dismissal
- `reportComment` upserts on `(comment_id, reporter_id)`: reopen a resolved row when
  the review was edited since. No schema change (a partial unique index would drift
  from Prisma and fail the CI `migrate diff` gate).

## WP-24d · A moderator who is not curl
- `User.role` + `/moderation` page, or keep the token route only. Decision Q1.

## WP-24e · Tell the author
- Needs `Notification` to accept a system actor or a nullable `actorId`, plus a
  `COMMENT_HIDDEN` type. Decision Q4.

## WP-24f · Queue hygiene
- Distinct-reporter counts, paging past 50, per-reporter rate limit. Decision Q2.


---

# Phase 5 — architecture hardening (planned; evidence in `docs/architecture-audit.md`)

Measured audit of the whole tree (import graph, strict-flag probe, build artifacts).
Verdict: the layout holds; the gaps are boundaries, client weight, and configuration.
No directory reshuffle is in scope.

| WP | Package | Closes | Effort |
|----|---------|--------|--------|
| WP-25 | Cut the `shared`/`infra` → feature edges, absorb `modules/api` into `infra/http`, then enable the layering + cycle guardrails — **done 2026-11-05**: `shared/` and `infra/` import no feature; 31-pair ratchet in `src/architecture.test.ts`. Remaining inversions (library↔discovery, comments↔notes, show↔episode-season) are named in the test, not fixed. | A1, A2, A8 | M |
| WP-26 | `next/dynamic` for the five interaction-only client surfaces + a chunk budget — **done 2026-11-05**: six call sites lazied (both watch dialogs, the report form); bell stays eager for the badge. No explicit budget asserted yet. | A3 | S |
| WP-27 | `verbatimModuleSyntax`, `ES2022`, unused/override flags (197 mechanical errors) — **done 2026-11-05**: flags on, 134 files rewritten to `import type` via the typescript-eslint autofix, four residuals fixed by hand. | A4 | S |
| WP-28 | Caching decision: stay on `unstable_cache` or move to `cacheComponents`/`use cache`; route-level `revalidate` either way | A7 | S/M |
| WP-29 | `infra/env.ts` with fail-fast parsing; migrate the 27 ad-hoc `process.env` reads | A5 | M |
| WP-30 | One validation contract at four request boundaries | A6 | M |
| WP-31 | `noUncheckedIndexedAccess` (135 sites), then `exactOptionalPropertyTypes` (43) | A4 | M |
| WP-32 | Test placement + barrel policy, documented and enforced | A9, A10 | S |

Sequencing note: WP-25 must land its moves *before* the cycle test is switched on, or the
guardrail starts red and gets ignored.

---

## Timeline (single developer, sequential inside a phase)

| Phase | Packages | Estimate |
|-------|----------|----------|
| 0 | WP-01..03 | 2.5–3 days |
| 1 | WP-04..08, WP-23 | 9–10 days |
| 2 | WP-09..16, WP-22 | 11.5–12.5 days |
| 3 | WP-17..21 | 4–5.5 days |
| **Total** | 23 packages | **~27–31 days** |

P0 alone is **~11.5–13 days** including the safety net — that is the number that matters
for "when is it safe to keep growing the user base".

---

## Definition of done

Per package: gates green, migration proved on a scratch database, tests added that fail
without the change, `SKILL.md`/`docs` updated when behaviour or invariants move (the
last three migrations all needed that).

Per phase:

- **Phase 0** — CI runs the full chain on every PR; a broken migration is caught
  automatically; failures are greppable by digest.
- **Phase 1** — no reachable path can delete unrelated watch logs, buffer an unbounded
  upload, trust a client MIME type, or leave orphaned objects without a sweep; rewatch is
  replay-safe; deleting a comment removes it, its attachments and its notifications with
  no soft-delete residue.
- **Phase 2** — instants are timezone-stable, cached fragments are tag-invalidated,
  unwatch is reversible, drift is detectable on demand, and the five core journeys are
  covered end to end.
- **Phase 3** — ratings are discoverable and scoped by an explicit decision, notes have
  a home, there is a report path for public content, and both write adapters share one
  contract.

## Metrics to watch after each phase

From WP-03 logs: 5xx per route, upload rejections by reason, DB queries per navigation,
unread-count poll rate per session, drift count from WP-14, orphan objects removed per
sweep, and p95 render time for `/library/[...slug]`.

## Rollback notes

- WP-04, WP-07, WP-08: additive nullable columns — revert by dropping the column, no
  data loss.
- WP-10 (`timestamptz`): rehearse on a dump; keep the pre-migration dump until the app
  has run a full day against the new column types; rollback = restore dump.
- WP-11 (caching): ship behind a flag (`MEDIA_CACHE=on`) so a stale-cache incident can
  be resolved by flipping one variable, not a deploy.
- WP-13 (soft-deleted logs): additive `deleted_at`; hard-delete consumers must filter
  it, so the flag flips together with the service change.
