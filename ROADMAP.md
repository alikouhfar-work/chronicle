# Chronicle — Strategic Roadmap

> Scaling, feature expansion & codebase refinement.
> Generated from a full audit of `src/`, `prisma/`, and app routes.
> Legend: **P0** do first · **P1** next · **P2** when time allows · Complexity **S** (days) · **M** (1–3 weeks) · **L** (month+)

---

## 1. Codebase Improvement & Refactoring

### 1.1 Code quality & tech debt

| # | Task | Priority | Complexity | Notes / location |
|---|------|----------|------------|------------------|
| 1 | Unify tracking-status sources of truth | P0 | S | Four parallel definitions: `library/lib/statusFilters.ts`, `show/lib/statusFilters.ts`, `movie/lib/statusFilters.ts`, `show/lib/showStatusConfig.ts` (+ `trackingStatusMap.ts` in `show/utils` and `movie/utils`). Titles already diverge (`Plan to Watch` vs `Plan To Watch`). Collapse to one enum-driven config. |
| 2 | Replace string-literal status checks with Prisma enums | P0 | S | `'COMPLETED'` / `'DROPPED'` hard-coded in `useWatchStats.ts`, `LibraryDetailsHeader.tsx:130`, `LibraryDetails.tsx:24`; `toUpperCase()` normalization in `LibraryShowProgress.tsx` is a third convention. A Prisma rename breaks silently today. |
| 3 | Extract shared aired-episode predicate | P0 | S | `(episode) => episode.airDate && episode.airDate <= new Date()` is duplicated verbatim in `LibraryDetailsSeasons.tsx:22` and `setSeasonWatched.ts:34`. Drift wedges the season-toggle label. Move to `episode-season` lib and import both sides. |
| 4 | Consolidate duplicate date/year helpers | P1 | S | Duplicated `toDate()` in `mapTitleDetails.ts` vs `buildShareMessage.ts`, year-range logic in three places (`mapTitleDetails.ts:43`, `buildShareMessage.ts:37`, `LibraryDetailsHeader.tsx:65`), four date-format conventions (`date-fns` vs `toLocaleDateString` vs `format()` vs raw `getFullYear()`). One `shared/lib/dates.ts`. |
| 5 | Extract shared `HeroPanel` / glow backdrop component | P1 | S | `glass-panel … rounded-3xl` + violet/indigo blur glows copy-pasted in ~10 files (`LibraryDetailsHeader`, `DashboardHeader`, `TitleDetailsView`, `PersonDetailsHero`, …). |
| 6 | Break up `addShow.ts` (195 lines) | P1 | M | Validation + 2-stage TMDB fetch + transaction + chunking + status special-casing in one function (`show/actions/addShow.ts`). Split fetch / map / persist. |
| 7 | Flatten nested ternaries into lookup maps | P2 | S | Season badge colors (`LibraryDetailsSeasons.tsx:64`), headline fallback + aria-label (`LibraryShowProgress.tsx:53,72`), `images.ts:36`. Follow the `STATUS_HEADLINES` precedent. |
| 8 | Fix relative `generated/prisma` imports to `@/` alias | P2 | S | ~22 sites climb with `../../../../generated/prisma/enums` (e.g. `show/lib/statusFilters.ts:2`). Fragile to file moves. |
| 9 | Retire dead demo-token path + `hasTmdbToken` stub | P2 | S | `TMDB_ACCESS_TOKEN ?? DEMO_TMDB_TOKEN` fallback wired through `tmdb/client.ts:41`, `forUser.ts:42`, `reset-demo/route.ts:57`; `hasTmdbToken` ignores its param. Also `try/catch` around pure string concat in `images.ts:38`. |
| 10 | Unify TMDB query entry point | P1 | S | `addShow`/`addMovie` import `tmdbFetch` directly while all catalogue queries use the `tmdbFetchForUser` alias (which is a pass-through). Pick one so token ownership lives in one place. |

### 1.2 Performance & rendering

| # | Task | Priority | Complexity | Notes / location |
|---|------|----------|------------|------------------|
| 1 | Paginate `getTrackedShows` / `getTrackedMovies` | P0 | M | Both do unbounded `findMany` with a 3-level `include` (seasons → episodes → tracking). No `take/skip/cursor` (`show/queries/getTrackedShows.ts:29`). Biggest single scalability lever; unblocks dashboard + library at 500+ titles. |
| 2 | Add `Suspense` boundaries to the dashboard | P0 | S | `(dashboard)/page.tsx` awaits header + up-next + trending + upcoming serially with zero boundaries; one slow `syncShow` delays everything. Library page already does this right — copy the pattern. |
| 3 | Stop serializing full payloads to client stats | P0 | M | `DashboardHeader` loads both full libraries then passes whole arrays to client `DashboardHeaderWatchStats` for a 5-number summary. Compute aggregates server-side (or a `COUNT`/`SUM` query) instead. |
| 4 | Bound the up-next refresh fan-out | P1 | M | Every up-next load fires `Promise.allSettled` over all `WATCHING` shows, each doing 1+N TMDB fetches (`getFreshTrackedShows.ts:15`). Gate on `shouldSyncShow` staleness first; cap concurrency. |
| 5 | Chunk `syncShow` writes like `addShow` does | P1 | S | `syncShow.ts:102` puts one upsert per episode in a single `$transaction` (100+ statements for soaps/anime). Reuse the `CHUNK_SIZE=500` chunking from `addShow`. |
| 6 | Slim the per-episode client bundle | P1 | M | Every `ShowDetailsEpisodeCard` is `'use client'` with `date-fns/format` + lazily-mounted log modal. Make the card a server component with a tiny client toggle button; import `date-fns/format` (not barrel) or replace with `Intl`. |
| 7 | Memoize repeated derivations | P2 | S | `getShowProgress`/`getShowPosition` per card, `airedEpisodes`/`isSeasonWatched` per render, triple-nested stats scan in `useWatchStats.ts:15` — all unmemoized. `useMemo` where lists are large. |
| 8 | Cap unbounded UI lists | P2 | S | Full `credits.cast.map()`, all `similarMedia`, `getUpcomingEpisodes` with no `take`. Slice cast to ~20 with "show all", cap similar to one row, add `take` to upcoming queries. |
| 9 | Right-size poster/backdrop widths | P2 | S | Grid thumbnails fetch `w500` backdrops (`SearchResultCard.tsx:37`); use `w342`/`w185` for cards, reserve `w780+` for heroes. |

### 1.3 Type safety & testing

**Strictness baseline:** `tsconfig` is `strict: true` only — missing `noUncheckedIndexedAccess`, `noUnusedLocals`, `exactOptionalPropertyTypes`. Zero real `any` in `src/` (good), but ~15 `as`-cast prod sites and `Date|string` + `string`-status boundaries carry the risk.

| # | Task | Priority | Complexity | Notes / location |
|---|------|----------|------------|------------------|
| 1 | Type `trackingStatus` props as Prisma unions | P0 | S | `libraryShowProgress.ts:8`, `LibraryCardStatus.tsx:4`, `libraryStatusChangeButton.ts:3-5` take `string`; callers already pass real `Show/MovieTrackingStatus`. Widening hides the movie-has-no-`DROPPED` asymmetry that today needs a `return 'none' as const` hack (`getTrackedMovies.ts:14`). |
| 2 | Fix `airDate!` crash in `mapUpcomingEpisodes.ts:12` | P0 | S | Field is `DateTime?`; any unaired episode throws inside grouping. Guard + add the missing null-`airDate` test (fixtures always set it). |
| 3 | Test `toggleEpisodeWatched` + `setSeasonWatched` | P0 | M | Highest-blast-radius untested units: ownership checks, cross-show mismatch, status rollup in `$transaction`, `startedAt` preservation asymmetry, unaired filter, empty-season early return. |
| 4 | Harden `deriveShowStatus` + `getShowProgress` edges | P1 | S | Split `tracking.test.ts` into one `it` per branch; add `watched>total`, `total=0`, S0-double-count, denominator-mismatch cases (`progress.test.ts` covers one 25% case + div-by-zero today). |
| 5 | Test `revalidate*` paths and filter/query-string logic | P1 | S | Every mutation depends on exact revalidate paths (mock `next/cache`); `LibraryFilters` debounce/optimistic-status/`createQueryString` guards and invalid URL values are untested. |
| 6 | Validate TMDB payloads at the boundary | P1 | M | `parseJson<T>` casts blindly (`tmdb/client.ts:171`); `mapTitleDetails` casts on `mediaType` alone. Add lightweight runtime checks (zod or hand-rolled) for details/season payloads before persist. |
| 7 | Handle the RSC `Date`→string boundary | P1 | M | Only `buildShareMessage` normalizes serialized dates; `ShowDetailsEpisodeCard.tsx:22,72` and `UpNextEpisodeCard` call `format()`/compare directly on values RSC serializes to ISO strings. Centralize a `DateLike → Date` coercion. |
| 8 | Enable `noUncheckedIndexedAccess` + `noUnusedLocals` | P2 | M | Catches `STATUS_HEADLINES[key]`-style indexing and dead code at compile time; fix fallout incrementally per module. |
| 9 | De-tautologize headline tests; replace `as never` fixtures | P2 | S | `LibraryShowProgress.test.tsx` derives expectations from the same lookup as the SUT; widespread `as never` fixtures hide shape drift — use typed factory builders. |
| 10 | Cover auth-guard + import-validation paths | P2 | M | `requireUserId`/bearer fallback, guest path, `MissingTmdbTokenError`, invalid-enum rejection in `setShowWatched`/`update*Status`, `addShow` invalid-date persistence. |

---

## 2. Architecture & Scalability

### 2.1 Data handling & state (scale)

- **P0 · Paginate + project list queries (M).** Beyond §1.2-1: return card-shaped DTOs from `getTrackedShows/Movies` (poster, counts, next-label) and fetch full seasons only on the details route. Everything downstream (filters, stats, cards) gets cheaper at once.
- **P0 · Persistent TMDB cache (M).** Today's cache is in-memory inflight-dedupe + 24h `fetch` revalidate — lost on restart, shared across all users on one quota (~40 req/s/IP). Move to a DB table or Redis/Upstash keyed by path+params, honoring `lastSyncedAt` invalidation. Prerequisite for reminders (Phase B) and multi-user demo.
- **P1 · Off-request jobs for sync/seed/reset (L).** `addShow` backfills, `syncShow` fan-outs, and `reset-demo` (60s `maxDuration`) all run inside request handlers. A queue (pg-boss/BullMQ) with progress + retry ends timeout roulette.
- **P1 · Hot-path indexes (S).** Add indexes on `ShowTracking.status`, `MovieTracking.status`, `Episode.airDate` (range scans in up-next/upcoming), and trigram/full-text index for `Show/Movie.name` search. Verify with `EXPLAIN` on a seeded 10k-episode DB.
- **P1 · Transactional `addShow` episode writes (S).** Show+seasons commit in `$transaction`, then episode chunks write outside it (`addShow.ts:151`) — a mid-loop crash leaves partial shows. Either extend the transaction or add a compensating cleanup + resume flag.

### 2.2 Directory structure & boundaries

- **P1 · Break the library ↔ episode-season cycle (S).** `ShowDetailsEpisodeCard` imports `LibraryDetailsLogModal` from `library/` while `LibraryDetailsSeasons` imports the card back. Move the log modal (or a shared episode UI) into `episode-season/` or `shared/ui` so the dependency arrow points one way.
- **P1 · Make module `index.ts` the real contract (S).** `LibraryShows` imports `getTrackedShows` via deep path while `show/index.ts` only exports lists/mappers. Export queries/actions through the barrel (or forbid deep imports with `eslint-plugin-import` zones) so refactors don't silently break consumers.
- **P2 · Colocate log/rating UI with its domain (S).** Movie logs live in `library/components/details/` but act on `movie/` actions; episode logs span both modules. Ownership should follow the data.
- **P2 · Promote `STATUS_HEADLINES`-style lookups as the pattern (S).** The codebase already converged on status→config maps in 3+ flavors — bless one shape (key → `{ title, colors, headline }`) and migrate the stragglers.

### 2.3 Resilience & error handling

- **P0 · Isolate TMDB partial failures on details/search pages (S).** `[...slug]/page.tsx:61` and the title page `Promise.all` credits+similar with the core entity — one 429/5xx throws the whole segment to `error.tsx`. `Promise.allSettled` + degrade (show details with an empty similar rail) instead.
- **P0 · Per-visitor demo sandbox (M).** All guests share one `demo@chronicle.local` user (`auth.ts:44`) — libraries collide and mutations cross-talk. Ephemeral per-visitor users with TTL cleanup (needs §2.1 job queue). Until then, at minimum scope demo writes visibly.
- **P1 · Fill `error.tsx`/`loading.tsx` gaps (S).** Present: `(main)/error`, `[...slug]/error+loading`, dashboard + person loadings. Missing: `library/page`, `search/*`, `person/[id]` error boundaries. Also teach the fallback UI about `retryable` errors (today everything renders generic `error.message` + `reset()`).
- **P1 · Distinguish stale-data from failure on dashboard/up-next (S).** `getFreshTrackedShows` swallows refresh errors in `catch{}` — the UI can't tell "slow TMDB" from "up to date". Surface `lastSyncedAt` staleness + a non-blocking retry affordance.
- **P2 · Offline story beyond static assets (M).** `public/sw.js` skips `document` requests entirely; no offline fallback page or runtime caching. Add a cached shell + queue episode toggles in IndexedDB for replay via `useServerAction` (feeds Phase B diary/history).
- **P2 · Harden `reset-demo` + `PRISMA_TARGET` handling (S).** Timing-safe secret compare + rate limit on the endpoint; `seed.ts:clearDatabase` does unscoped `deleteMany` — assert non-production DB URL before wiping.

---

## 3. Feature Expansion

### Phase A — Quick Wins (days each, no migration)

| # | Feature | Value | Complexity | Risk / dependency |
|---|---------|-------|------------|-------------------|
| 1 | Genre chips + rating/progress sort in `LibraryFilters` | Filter on already-loaded data | S | URL param growth; reuse `useQueryString` |
| 2 | Derived show rating (avg. episode ratings) in header + share | Closes the show-rating gap without schema change | S | Skew with few ratings; extend `buildShareMessage:rating()` |
| 3 | One-click library export (JSON/CSV download) | Backup peace of mind | S | Large libraries block UI — chunk serialization |
| 4 | Watch streak + weekly heatmap from `watchedAt`/`completedAt` | Makes existing timestamps visible | S | Timezone grouping; reuse `date-fns` |
| 5 | Surface season toggle in Up-Next rows | Reuses `LibraryDetailsSeasonActions` where users already are | S | Sync race with `lastSyncedAt` |
| 6 | PWA correctness pass (manifest MIME fix, offline fallback, poster caching) | Installability + offline reads | S | iOS `standalone` quirks |

### Phase B — Core Enhancements (1–3 weeks, schema or new routes)

| # | Feature | Value | Complexity | Risk / dependency |
|---|---------|-------|------------|-------------------|
| 1 | Custom lists (`List` + `ListItem`, `/library/lists/[id]`) | Curation beyond status filters | M | Polymorphic show/movie item integrity |
| 2 | Import + full restore (Letterboxd/CSV/TMDB) | Onboarding + pairs with A3 export | M | TMDB rate limits; reuse fetch retry/dedupe |
| 3 | Returning-season reminders ("Follow" bell → `Follow` + `Notification`) | Re-engagement killer feature | M | Needs Phase C notification infra |
| 4 | Public share pages `/u/[token]` + taste compare | Fixes auth-walled share unfurl; lightweight social | M | Privacy — opt-in only, token URLs |
| 5 | Stats dashboard `/stats` (genres, pace, rating distribution) | Turns header numbers into insight | M | Heavy aggregations — needs §2.1 indexes |
| 6 | Diary/history timeline `/history` | Journal view from `watchedAt`/`completedAt` + notes | M | Pagination across two tracking tables |

### Phase C — Scalability & Infrastructure (long-term)

| # | Feature | Value | Complexity | Risk / dependency |
|---|---------|-------|------------|-------------------|
| 1 | Persistent TMDB cache (Redis/Upstash + tags) | Survives restarts, protects shared quota | L | Invalidation on `lastSyncedAt` |
| 2 | Job queue (pg-boss/BullMQ) for sync/seed/reset | Ends request-timeout roulette | L | Operational complexity |
| 3 | Notification infra (Web Push + email abstraction) | Prerequisite for B3 reminders | L | VAPID keys, user prefs |
| 4 | Offline-first mutations (IndexedDB queue) | Mobile-grade reliability | L | Conflict resolution on replay |
| 5 | Documented Mobile API `/api/v1/*` on `mobileJwt` bearer | Unlocks native app per existing contract | M | Auth surface + rate limiting |
| 6 | Observability (OTEL/Sentry) + per-visitor sandbox TTL | Debuggable prod, isolated demos | L | DB bloat without cleanup job |

---

## 4. Suggested sequencing

1. **Stabilize (week 1–2):** §1.1-1 + §1.3-1/2/3 (status unification, aired predicate, episode-toggle tests) and §2.3 partial-failure isolation. Small diffs, kill whole bug classes.
2. **Scale the hot path (week 3–4):** §1.2-1/2/3 + §2.1 indexes + `syncShow` chunking. Measure with a seeded large library before/after.
3. **Harden + expand (month 2):** remaining §2.2 boundaries, §2.3 error-boundary gaps, Phase A quick wins (export, streak, derived rating).
4. **Grow (quarter):** Phase B in order 3 → 1 → 5 → 2 → 6 → 4 (reminders need C3 infra started early), with C1/C2 underneath as load demands.

*Parked (from prior planning): DB-backed TMDB response cache up to 6-month TTL, `append_to_response` collapsing, per-user BYO TMDB token — revisit past hundreds of active users.*
