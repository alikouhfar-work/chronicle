# Chronicle — product gap & implementation risk audit

Scope: the product concept as implemented today (watch/rewatch tracking, decoupled
ratings, notes and public reviews, object-storage attachments) and the Next.js App
Router / Prisma architecture underneath it.

Method: read the write paths end to end (actions → services → schema → migration),
exercised the running app, ran the queries through `EXPLAIN`, and checked data
invariants against the dev database. Every claim below is tied to code.

Severity is about user-visible damage or cost of being wrong, not effort:

- **P0** — data loss, security exposure, or abuse vector; fix before the next
  deploy.
- **P1** — wrong data on screen, silent failure, or a scale ceiling users will hit.
- **P2** — friction, missing affordance, or maintenance hazard.

---

## Executive summary

| # | Risk | Severity |
|---|------|----------|
| 1 | Season/show rewatch deletion matches child logs by timestamp — one delete can take out unrelated watches | P0 |
| 2 | Upload route buffers the whole body before checking size; MIME is client-declared | P0 |
| 3 | No security headers (no CSP, no `nosniff`, no frame/referrer policy) on a UGC app | P0 |
| 4 | Uploads and comments have no rate limit or quota; uploaded objects are never garbage-collected | P0/P1 |
| 5 | Rewatch logging is not idempotent — retries and second tabs duplicate logs | P1 |
| 6 | Every page is `force-dynamic`; notification bell polls each tab every 60s via a server action | P1 |
| 7 | Air dates are `timestamp without time zone` compared to server `now()` | P1 |
| 8 | Season rewatch rule is invisible in the UI — a season can be "not rewatched" with no explanation | P1 |
| 9 | In-memory rate limiter scans its whole map per request and dies with the process | P2 |
| 10 | Demo reset cron disagrees with its own comment and shares one account | P2 |

---

## A. Watch / rewatch flows

### A1. Cascaded log deletion keyed on a timestamp (P0)

`removeRewatchLog` deletes a season or show log, then finds the child episode logs
to delete by `(userId, mediaType = EPISODE, seasonId, rewatchedAt)` —
`rewatchService.ts:611-625` and `:645-660`.

Two independent writes that land in the same millisecond are indistinguishable:

- Two season rewatches submitted back to back (double click, two devices, a retry)
  produce two batches at the same `rewatchedAt`. Deleting one log deletes both
  batches (`deleteMany` by timestamp), and the episode counters are decremented
  once — so counters and logs disagree permanently.
- An individual episode watch logged in the same millisecond as a season batch is
  swept up with the batch, silently removing a watch the user did not touch.

**Recommendation.** Give cascade groups an explicit identity instead of inferring
them:

```prisma
model RewatchLog {
  groupId String? @map("group_id") // = parent log id for cascaded rows
  @@index([groupId])
}
```

`recordRewatch` sets `groupId` on every child row to the parent log's id; removal
deletes `where: { groupId: parentId }`. A separate `batchId` uuid also works and
avoids the FK-to-itself question. Backfill existing rows with `groupId = null`
(today's behaviour only ever produces a single batch, so grandfathering is safe).

### A2. Rewatch is not idempotent (P1)

`addRewatch` takes no request key; the modal's busy state only blocks the same tab
(`WatchActionModal.tsx:63`). A retried server action (network timeout), a second
tab, or a double-submitted REST call (`/api/media/[type]/[id]/rewatch`) logs the
watch twice, and the counters happily follow.

**Recommendation.** Accept an optional `clientRequestId` (uuid minted when the
dialog opens) and make `(userId, clientRequestId)` unique on `rewatch_logs`; treat
a conflict as success. Cheap, and it also makes the REST route retry-safe.

### A3. "Unwatch" is all-or-nothing and irreversible (P1)

Unwatching a show clears every episode log, every season log, zeroes the counters
and resets the status (`clearShowWatchHistory`). There is no undo, no warning of
how many watches will be destroyed, and no distinction between "I never watched
this" and "I logged it against the wrong show".

**Recommendation.** Show the destructive count in the dialog ("This removes 47
logged watches"), and either soft-delete the batch (a `deleted_at` on logs with a
10-minute undo toast) or keep an audit row per removal. Ratings already survive;
the watch history should be recoverable for a short window too.

**Fixed (WP-13 / WP-13b).** The dialog states what goes away
(`RemoveRewatchResult.removedLogs`), and every delete path — unwatch and the
single-log removal in the history dialog — now records a `rewatch_log_removals`
snapshot of the rows *and* the counters/tracking values it changed. The toast
offers **Undo**; `restoreWatchRemoval` replays the snapshot inside the 10-minute
window, refuses once new watches landed on the same title, and
`GET /api/maintenance/rewatch-removals` (plus an opportunistic sweep on each new
removal) purges closed windows. A `deleted_at` flag was rejected because every
read of `rewatch_logs` would have had to learn to filter it, and the tracking
timestamps the unwatch destroys cannot be re-derived from a soft-deleted row.

### A4. A rewatch log can never be corrected (P1)

`rewatch/actions/` has add, remove, load, unwatch — no update. A wrong date can
only be deleted and re-added, which loses the original ordering.

**Recommendation.** `updateRewatchLog({ logId, rewatchedAt })` with the same
ownership check, plus a date field in `RewatchHistoryModal`.

### A5. Season rewatch rule is opaque (P1)

The rule (every episode ≥ 4 watches, at least two ≥ 5, count = lowest − 3) is
correctly derived and tested, but the UI only ever says "0 watches". A user who
has watched a season twice sees nothing, with no hint that two lagging episodes
gate the whole season.

**Recommendation.** In the season header, when a season is watched but not
qualified, render the gap: "Season rewatch unlocks when every episode has 4
watches — 2 episodes are at 2". `computeSeasonRewatchCount` already has the
inputs; expose the shortfall as a return value rather than recomputing in the UI.

---

## B. Ratings and notes

### B1. Ratings exist only for movies and episodes (P1)

`MovieTracking.rating` and `EpisodeTracking.rating` are the only rating columns,
and `setMediaRating` rejects anything else. A user who thinks in seasons or shows
cannot express "this season is a 4".

**Recommendation.** Decide explicitly. Either document ratings as per-episode /
per-film (current behaviour) and remove the ambiguity from the UI, or add
`ShowTracking.rating` and `Season.rating` and let the aggregate views roll up.

### B2. Rating lives inside the notes tab (P2)

`RatingControl` is rendered only from `PersonalNotesPanel` (`:141`). Rating is
decoupled in the data model but coupled in the UI: to rate a film you must open
the "Personal notes" tab, and a user who has no notes may never find it.

**Recommendation.** Duplicate the rating control into the media header next to
the watch state; it writes the same action and needs no new endpoint.

**Fixed (WP-17).** `RatingControl` has a `compact` variant, rendered in
`LibraryDetailsHeader` (movie) and labelled "Rate this movie". The previous header
card only appeared once a film was completed; the control is there for any tracked
title, so a rating no longer requires finishing the film or opening the notes tab.
The episode page keeps its rating in the Personal Notes tab — no header control
(decided after shipping: an episode's rating lives with its notes).

### B3. Notes have no home outside their media page (P2)

`MediaNote` is many-per-media, soft-deleted and private, but there is no "my
notes" surface: no list, no search, no count badge, no export. Over time this is a
write-only feature.

**Recommendation.** A `/notes` route (list + search over `content`) is a filter on
the existing index, and it makes the privacy promise of notes tangible.

**Fixed (WP-18).** `/notes` lists every non-deleted note newest-first with a content
search, resolves each title from the owner's library in three batched reads
(`notes/services/listNotesForUser`), and links to the details page — an episode note
links through its show. A note whose title was removed from the library is still
listed, unlinked, rather than disappearing.

### B4. Notes and comments share a shape but not a lifecycle (P2)

Both are soft-deleted rows keyed by `(userId, mediaType, tmdbId)`, but comments
carry attachments, mentions and notifications while notes carry none; the delete
paths are duplicated. Not wrong, but every future feature (reactions, editing
history) has to be built twice.

**Recommendation.** Leave the tables separate (different audiences justify it) but
extract the ownership + soft-delete + validation pattern into one helper both
actions call, so the rules cannot drift.

---

## C. Comments, mentions, notifications

### C1. Replies never notify (P1)

`NotificationType` has exactly one member, `COMMENT_MENTION`. Replying to someone
— by writing a review under the same title, the natural conversation on this
product — notifies nobody. The bell therefore only fires for `@handle`, which
users must know to type.

**Recommendation.** Add `COMMENT_REPLY` (notify the previous commenter on the
same media, or an explicit reply target), and treat mentions as a second,
independent trigger.

### C2. No moderation surface (P2)

Anyone signed in can post on any title they own, with images, and there is no
report, block, or admin removal path. Deletion is author-only (`deleteComment`
checks ownership). For a public feed this is the first thing that gets abused.

**Recommendation.** At minimum a report row (`CommentReport(commentId, reporterId,
reason)`) and a soft "hidden by moderator" flag that the feed filters, plus a
reason field on deletion so the author sees why.

**Fixed (WP-19).** `comment_reports` plus `comments.hidden_at`/`hidden_reason`; readers
flag a review from the feed (`reportComment`, one per reader per review),
`GET/POST /api/moderation/reports` (Bearer `CRON_SECRET`) lists the queue and applies
`hide`/`dismiss`, `listComments` drops hidden rows for everyone but their author, and
the author sees the moderator's reason on their own review. Operational follow-ups
(recording who decided, unhide, re-reporting a dismissed review, notifying the
author) are specified in `docs/moderation-audit.md`.

### C3. Mentions resolve per comment, without a cap (P2)

`createComment` extracts every handle, resolves them in one lookup, and writes one
notification per mention in the same nested create. A comment mentioning 40 people
creates 40 notifications in one transaction; the UI does not limit how many
handles it suggests.

**Recommendation.** Cap mentions per comment (e.g. 10) in the action, matching the
attachment cap, and return a clear error instead of silently dropping.

---

## D. Attachments and object storage (S3-compatible / Parspack)

### D1. The body is read into memory before it is validated (P0)

`/api/comments/upload` does `await request.arrayBuffer()` (`:26`, `:36`) and only
then compares `buffer.length` to the 5 MB limit (`:73`). A 500 MB POST is fully
materialised in a serverless function's memory before rejection. The multipart
path has the same shape.

**Recommendation.** Reject on `Content-Length` first, then stream the body through
a counting transform that aborts once it exceeds the limit. `NextRequest` bodies
are web streams; `new Response(stream.pipeThrough(cap(5MB)))` keeps memory flat.

### D2. The content type is whatever the client says (P0)

`file.type` / `?contentType=` is trusted, and the object is stored with that
`ContentType` and served with an immutable cache header. The bytes are never
inspected, so an HTML or SVG payload labelled `image/png` is stored and served;
with no `X-Content-Type-Options: nosniff` anywhere (see D3) a browser can be
convinced to execute it as a document.

**Recommendation.** Sniff magic bytes server-side (`file-type`), reject anything
that is not JPEG/PNG/WebP, and derive the stored `ContentType` from the sniff —
not from the request. Add `nosniff` to both the upload response and the file
serving route.

### D3. No security headers at all (P0)

`next.config.ts` sets `output` and `images.remotePatterns` and nothing else. No
CSP, no `X-Content-Type-Options`, no `X-Frame-Options`/`frame-ancestors`, no
`Referrer-Policy`, no HSTS. For an app that renders user text and user images and
holds a session cookie, this is the cheapest hardening available.

**Recommendation.** Add a `headers()` block: `nosniff`, `frame-ancestors 'none'`,
`Referrer-Policy: strict-origin-when-cross-origin`, a CSP that allows
`image.tmdb.org` plus the storage origin and disallows inline script (Next needs a
nonce for that; start in report-only), and HSTS in production.

### D4. Uploaded objects are never cleaned up (P0/P1)

Three leak paths:
1. Upload succeeds, the comment is never created (abandoned composer, validation
   failure later) — the object stays forever.
2. A comment is soft-deleted (`deleteComment` only sets `deletedAt`); the
   attachment rows and the objects remain, and the `/api/comments/files` route
   still serves them by key.
3. A user is deleted: `CommentAttachment` cascades away with the comment, but the
   bucket objects do not.

**Recommendation.** Stamp `storage_key` on the attachment row at creation (the URL
is already minted server-side), then run a periodic sweep: keys present in the
bucket with no row older than 24 h are deleted; rows soft-deleted beyond a
retention window are purged with their objects. A `attachment_gc` cron route with
the existing `CRON_SECRET` pattern is enough — no new infrastructure.

### D5. Uploads have no quota or rate limit (P0/P1)

One signed-in account can upload unlimited 5 MB objects. The only rate limiter in
the codebase is on username search (see E4).

**Recommendation.** Per-user daily byte quota (a `SELECT sum(size_bytes)` over the
user's attachments is enough at this scale) plus a token-bucket on the route.

### D6. The local-disk fallback is a footgun (P2)

`storage.ts` falls back to `COMMENT_STORAGE_DIR` (default `.data/comment-uploads`,
CWD-relative) when `S3_BUCKET` is absent. It works locally and silently on a
server with an ephemeral filesystem, where uploads vanish on restart and each
instance sees only its own files.

**Recommendation.** Keep the fallback for dev, but fail fast in production: if
`NODE_ENV === 'production'` and no bucket is configured, throw at boot with a
message that names the missing variable.

---

## E. Next.js App Router architecture

### E1. Everything is `force-dynamic` (P1)

The dashboard, library list, library details, episode page and profile all declare
`dynamic = 'force-dynamic'`. Nothing is cached, so every navigation re-runs the
Prisma queries and, for TMDB-backed sections, re-enters the fetch cache (which is
24 h — the asymmetry is intentional but means DB work scales linearly with
traffic).

**Recommendation.** Split the page into a dynamic shell (user-scoped rows) and
cached fragments (trending, similar titles, genre dictionary) behind
`unstable_cache`/`"use cache"` with explicit tags, invalidated by the existing
`revalidateLibrary`/`revalidateMediaDetail` helpers. Keep `force-dynamic` only for
the user-owned parts.

### E2. `revalidatePath` on concrete paths under a catch-all route (P2)

`revalidateMediaDetail` calls `revalidatePath('/library/movie/550')`, but the route
is `library/[...slug]/page.tsx`. For cached routes Next expects the pattern, e.g.
`revalidatePath('/library/[...slug]', 'page')`. Today the pages are
`force-dynamic`, so the call is a no-op rather than a bug — the moment E1 lands,
this silently stops invalidating.

**Recommendation.** Fix the helper now (pattern + `'page'`), or switch those pages
to tag-based invalidation (`revalidateTag('media-550')`), which composes better
with the caching change.

### E3. Two write paths for the same operation (P2)

Rewatch writes exist both as server actions (`rewatch/actions/*`) and as REST
routes (`/api/media/[type]/[id]/rewatch`, `/rewatch/[logId]`,
`/rewatch-history`). Both call the same service, but validation, auth and error
mapping are duplicated and already differ slightly (the routes return HTTP codes,
the actions return result objects).

**Recommendation.** Keep the service as the only implementation and make both
adapters thin, with one shared input parser. Add a contract test that runs the
same fixture through both paths and compares the resulting rows.

**Fixed (WP-21).** `rewatch/lib/writeContract` owns the body aliases, the id/media
validation and the failure mapping (`{ message, status, code }`); the action and the
REST adapter both build their command there. `writeContract.parity.test.ts` proves the
same fixture reaches the service identically through both, and that one failure reads
the same on both paths.

### E4. The notification bell polls per tab, through a server action (P1)

`NotificationBell` runs `getUnreadCount()` on mount, on every `pathname` change,
and every 60 s (`:16`, `:70`) — with no `document.visibilityState` check. Each
call is a POST → auth → DB count. Ten idle tabs are ten queries a minute, and
every navigation doubles the fetch (mount effect + pathname effect).

**Recommendation.** Skip polling when the tab is hidden, dedupe the mount/nav
effects, and serve the count from a cache tag invalidated when a notification is
created (it is created in exactly one place). If real-time is wanted later, an SSE
route is a smaller step than websockets.

### E5. In-memory rate limiting (P2)

`/api/users/search` keeps a `Map` per process, sweeps the entire map on every
request (`:14-16`), and resets on deploy. On serverless it is effectively no limit.

**Recommendation.** Move the limiter behind the same place as the upload quota —
one Postgres-backed counter table (`rate_limits(key, window_start, count)`) is
sufficient and survives cold starts.

---

## F. Data and concurrency

### F1. Stored derived counters have no reconciliation job (P1)

`rewatch_count` is derived from logs but materialised on four tables, and
`syncSeasonRewatchCount` recomputes a whole season inside the write transaction.
The rule is correct and currently drift-free (verified), but nothing detects drift
after a bug, a manual SQL fix, or a partial failure; the season rule needed a
one-off migration earlier for exactly that reason.

**Recommendation.** Add a read-only reconciliation query behind an admin/cron
route (or a `--check` mode in the seed script) that reports mismatches without
fixing them, and a small integration test asserting zero drift after the cascade
scenarios. Cheap insurance.

### F2. One show rewatch writes O(episodes) rows and recomputes every season (P2)

`recordRewatch(show)` inserts one log per season plus one per episode, increments
all episode counters with a single `updateMany`, then loops
`syncSeasonRewatchCount` once per season (`rewatchService.ts:404-414`). Each of
those reloads the season's episodes inside the same transaction, so a 10-season
show costs 10 extra queries over 115+ rows while holding locks on the whole show.
Fine at this size; it grows with library size and seasons.

**Recommendation.** Derive every season count for a show in one grouped query
(`SELECT season_id, min(... ) ... GROUP BY season_id`) and write the results in a
single `updateMany` per distinct value, instead of a per-season round trip.

### F3. Time handling mixes `now()` with timestamp-without-time-zone (P1)

Air-date windows compare `Episode.airDate` (a `timestamp without time zone`) to
`now()` in queries (`getUpcomingEpisodes`, `getUpNextEpisodes`), and `createComment`
explicitly sets `createdAt` because "local Postgres instances often are not UTC"
(`:100-102`). A user in UTC+3:30 sees tonight's episode flip between "upcoming"
and "aired" depending on where the server runs.

**Recommendation.** Standardise on `timestamptz` for all instants (Prisma
`@db.Timestamptz`), compute windows in UTC, and format in the viewer's locale on
the client. The migration is mechanical but must be done before data grows.

### F4. Guest/demo sharing (P2)

Guests sign into a single demo account, against a separate database selected by
`PRISMA_TARGET` at process start. Everyone in the demo therefore shares one
library, one comment history and one notification inbox; two deployments (demo +
personal) cannot share a process.

**Recommendation.** Fine for a demo, but make it explicit in the product (banner,
"shared demo library" already exists) and give the reset job a lock so two
concurrent runs cannot interleave.

### F5. Demo reset cron contradicts its documentation (P2)

`.github/workflows/reset-demo.yml` says "every Monday and Thursday at 5:00 AM
IRST" and schedules `30 1 * * 5` — Fridays only, 01:30 UTC (05:00 IRST). Also
hardcodes a Vercel URL and reads `secrets.CRON_SECRET`.

**Recommendation.** Fix the cron (`30 1 * * 1,4`) or the comment, and make the URL
a repository variable.

**Fixed (WP-20).** The workflow schedules `0 2 * * 1,4` (Monday and Thursday, 05:30
IRST), reads `vars.DEMO_RESET_URL` (error when unset), and serialises runs with a
`concurrency` group; the route itself takes a Postgres advisory lock and answers 409
to a second caller, so a manual curl cannot interleave with the cron either.

---

## G. Operability and testing

### G1. No end-to-end or concurrency coverage (P1)

Tests are unit + jsdom components + one Postgres integration suite for rewatch.
Nothing exercises the real user journeys (sign in → add title → mark watched →
rate → comment with attachment), and nothing tests two writers racing the same
season.

**Recommendation.** Playwright for the five core journeys against a seeded
database, plus a concurrency test that fires two identical rewatch requests and
asserts one log per intent (that test also proves A2 and A1).

### G2. Errors go to `console.error` (P2)

21 call sites log and return a generic message. There is no request id on error
pages, no structured log, no metric. When a user reports "it broke", the only
correlation is the Next digest.

**Recommendation.** A tiny logger (`src/infra/logging`) that emits JSON with
`userId`, `route`, `action`, `digest`; wire it into `ErrorState`'s digest and the
action catch blocks. Ship it to whatever sink is cheapest (Vercel logs, or a
Postgres `app_events` table at this scale).

### G3. Migration safety depends on discipline (P2)

`migrate dev` cannot reproduce the chain (one historical migration was edited after
apply), so the team uses `migrate deploy` and proves changes on scratch databases.
Nothing enforces that in CI.

**Recommendation.** CI job: `prisma migrate diff --from-migrations
--to-schema` must be empty, plus `migrate deploy` against a fresh database and the
integration suite. That catches the "forgot the migration" and "hand-edited SQL"
classes immediately.

---

## H. What is already in good shape

Worth stating, so the fixes above are proportional:

- Ratings genuinely decoupled from notes; multiple notes per media; both private.
- Rewatch counters derived from logs with a tested rule, and a CHECK constraint
  that keeps the polymorphic pointer honest.
- Comments are scoped by TMDB id (shared conversation across libraries) with a
  stable snapshot on notifications, so deleted media does not blank the bell.
- Ownership checks on every comment/note/rewatch write, mentions derived
  server-side only, rendered content escaped.
- Cursor pagination with index-backed tiebreaks; the two hot read paths now use
  index scans.
- Strict module split (services vs queries vs actions) with an architecture test.

---

## Prioritised plan

**Now (P0, days)**
1. `groupId` on `rewatch_logs` for cascade deletion (A1) + test.
2. Streaming upload cap, magic-byte sniffing, `nosniff` on upload and file routes
   (D1, D2).
3. Security headers in `next.config.ts` (D3).
4. Per-user upload quota + limiter shared with username search (D5, E5).
5. Object GC job for abandoned and soft-deleted attachments (D4).
6. Idempotency key on rewatch (A2).

**Next (P1, 1-2 weeks)**
7. Reply notifications + mention cap (C1, C3).
8. `timestamptz` migration and UTC windowing (F3).
9. Cache the non-user fragments; fix `revalidatePath`/move to tags (E1, E2).
10. Bell polling: visibility-aware, deduped, tag-invalidated (E4).
11. Destructive-unwatch confirmation + undo window; log editing (A3, A4).
12. Reconciliation query + drift integration test (F1).
13. Playwright journeys + concurrency test (G1).

**Later (P2)**
14. Rating placement in the header and a decision on season/show ratings (B1, B2).
15. `/notes` index, moderation/reporting, structured logging, CI migration guard,
    demo cron fix (B3, C2, G2, G3, F5).

---

## Open questions for the product owner

1. Should shows and seasons be ratable, or are ratings strictly per-episode and
   per-film?
Answer: we can keep the rating for episode and film only for now.

2. Is the public review feed intended to grow threads/replies, or stay flat? This
   decides C1/C2 and the notification model.
Answer: the review system stays flat for now.

3. Demo: one shared account forever, or per-visitor sandboxes (which would need
   session-scoped libraries rather than a single `PRISMA_TARGET` database)?
Answer: i only need a demo account for visitors who are to check my product.

4. Retention: how long should a soft-deleted comment keep its images?
Answer: there should be no soft delete, when a comment gets deleted, it should go forever alongside its attachments(if there is any.)
