---
name: chronicle-frontend
description: Use when working on chronicle movie/TV tracker at Desktop/Projects/Personal/chronicle. Covers Next.js App Router, Prisma Postgres, TMDB discovery, NextAuth, show/movie/episode tracking, library/dashboard/person pages, Tailwind PWA. Use ONLY for this frontend project.
---

# Chronicle Frontend

Skill for the Chronicle personal movie and TV show tracker.
Project root: `Desktop/Projects/Personal/chronicle`

## When to use me

Use this when the task touches:
- `src/app`, `src/modules/`, `src/infra/`, `src/shared/`, `prisma/`
- dashboard, library, show/movie/episode tracking, TMDB search/trending/person, auth
- Next.js build/dev, Prisma migrations/seed, Docker Postgres, Vitest

Do NOT use for unrelated projects under `Desktop/Projects/`.

## Stack

- Next.js `16.3.8` App Router + React `19.2.4` + TypeScript strict (`bundler` resolution)
- Tailwind CSS `4` (`@tailwindcss/postcss`), `prettier-plugin-tailwindcss`, `clsx`
- Package manager: npm (README also shows `bun install` as alternative) — scripts are `npm run ...`
- Prisma `7.9.1` + `@prisma/adapter-pg` + `pg`, Postgres `17.5` via Docker
- Data source: TMDB API v3 server-side only via single shared `TMDB_ACCESS_TOKEN` (`src/infra/tmdb/client.ts` `tmdbFetch`), `next/image` remote pattern `image.tmdb.org/t/p/**`. No per-user tokens.
- Auth: `next-auth@5.0.0-beta` + `@auth/prisma-adapter`, Google + Credentials (email/password `bcryptjs`) + guest
- UI: `@tabler/icons-react`, `react-hot-toast`, `date-fns`, PWA (`manifest.ts` + install prompt)
- Testing: Vitest `5` + Testing Library + jsdom, tests live as `src/**/*.test.{ts,tsx}`
- Path alias: `@/*` -> `./src/*`
- Generated Prisma client: `generated/prisma/` — never hand-edit

## Commands (run from project root)

```bash
npm run dev                # next dev -> http://localhost:3000
npm run build              # next build (output: standalone)
npm start                  # next start (use npm run start)
npm run lint               # eslint
npm test                   # vitest run (once)
npm run test:watch         # vitest watch

npx prisma migrate dev     # local migration (prisma.config.ts picks URL by PRISMA_TARGET)
npx prisma db seed         # runs tsx prisma/seed.ts — clears DB, seeds trending TMDB titles
docker compose up -d       # postgres chronicle-db on host 5434 (container 5432)
docker compose logs -f app # only if app service is uncommented
```

DB URL pattern (see `.env.development`):
`DATABASE_URL=postgresql://admin:<password>@localhost:5434/chronicle`
`DEMO_DATABASE_URL=postgresql://admin:<password>@localhost:5434/chronicle_demo`

## Project map

```
src/app/(main)/(dashboard)/  # dashboard page (watch stats, up-next, trending, upcoming)
src/app/(main)/library/      # library list + [...slug] details (seasons, cast, similar, activity log)
src/app/(main)/search/       # TMDB-backed search page
src/app/(main)/person/[id]/  # person details + filmography
src/app/login/ signup/       # auth pages (signIn -> /login)
src/app/api/auth/[...nextauth]/  # NextAuth handlers
src/app/api/reset-demo/     # demo reseed endpoint (cron via .github/workflows/reset-demo.yml)
src/proxy.ts                # auth-only route guard (no token gate)
src/modules/dashboard/      # watch-stats header (components/, types/)
src/modules/discovery/      # search/person/credit/genre — queries, mappers, types
src/modules/episode-season/ # services getUpNext|UpcomingEpisodes, getTrackedEpisode, findTrackedEpisode, getEpisodeDetails; actions toggleEpisodeWatched, markSeasonWatched
src/modules/library/        # library cards/filters/details (server-owned media-type switch), actions/addMediaToLibrary (domain op) + addMediaAction (server action wrapper)
src/modules/media/          # shared entities, queries/fetchTrendingRaw|fetchSimilarRaw|fetchCredits|attachTrackedFlags|tmdbKind, mappers/mediaMappers, tracking.ts
src/modules/movie/          # services/getTracked*|Upcoming, queries/getTrending|Similar|Credits, actions/add|delete|updateStatus|addLog
src/modules/show/           # services/getTrackedShow(s)|getTrackedShowsLookup|getSyncedTrackedShow|syncStaleTrackedShows, queries/getTrending|Similar|Credits, actions/add|sync|markShowWatched|delete|updateStatus
src/modules/auth/           # LoginForm, SignupForm
src/modules/comments/       # MentionComposerTextarea, MediaCommentTabs (personal/public tabs), PublicReviewsPanel (owner edit/delete), services/{getCommentById,getCommentViewer,listComments,resolveMentionUsers,getUserMediaName} + actions/create|update|delete (ownership-checked, soft-delete, mentions re-derived on edit), constants.ts, lib/mentions (server extraction regex)
src/modules/notes/          # private per-media notes: services/listNotes + isMediaInUserLibrary, actions/create|update|delete (soft-delete), components/PersonalNotesPanel|NoteComposer|RatingControl
src/modules/notifications/  # services/listNotifications|getUnreadCount|attachNotificationHrefs (recipient-scoped), lib/notificationHrefs (pure deep-link builders), actions/markNotificationRead|markAllNotificationsRead, components/NotificationBell (header badge + popover deep-links)
src/modules/rewatch/        # actions (thin) -> services/rewatchService (record/remove counts, cascade rules, derived season counts), components/RewatchButton|RewatchHistoryButton|RewatchHistoryModal|WatchActionModal (episode/season/show/movie rewatch-unwatch dialog), lib/seasonRewatch (Task 13 rule), lib/mediaType
src/modules/user/           # services/getProfileSummary (DB), actions/updateUsername|ensureUsername, components/UsernameForm
src/infra/db/prisma.ts       # singleton PrismaClient via PrismaPg (PRISMA_TARGET personal|demo)
src/infra/auth/auth.ts       # NextAuth config (google/credentials/guest, PrismaAdapter, jwt)
src/infra/tmdb/client.ts     # tmdbFetch (single server token, retry 3x, backoff, GET dedupe, 24h cache)
src/infra/tmdb/forUser.ts    # requireUserId + tmdbFetchForUser alias (delegates to tmdbFetch, no per-user token)
src/infra/tmdb/images.ts     # image URL helpers (TMDB_IMAGE_BASE_URL)
src/shared/lib/             # formatMinutes, getDaysUntilAirDate, errors, validate, navigation, toast (custom AppToast helpers), revalidate
src/shared/ui/ hooks/ types/ # shared UI incl. AppToast, server-safe Header + client HeaderNav/HeaderActions, Footer nav leaf; hooks useQueryString/useServerAction/usePrefersReducedMotion; lib/computeWatchStats
prisma/schema.prisma        # Show, Movie, Season, Episode, Genre, Show/Movie/EpisodeTracking, User/Account/Session
                             # Show/Movie: @@unique([userId, tmdbId]); Season: @@unique([showId, seasonNumber]) + @@index([tmdbId]); Episode: @@unique([seasonId, episodeNumber]) + @@index([tmdbId]) — Season/Episode tmdbId is NOT globally unique (multi-user)
prisma/seed.ts              # trending seed with randomized tracking statuses
generated/prisma/           # generated client — never hand-edit
```

## Conventions

```
src/modules/<domain>/
  services/     # DB reads only ('server-only' or 'use server')
  queries/      # external API reads only (tmdbFetch)
  actions/      # writes ('use server')
  components/   # ui; 'use client' only on interactive leaves
  mappers/ lib/ utils/
  types/        # type-only files — no runtime code
  constants.ts  # runtime constants (limits, maps)
```

- Module layout: `src/modules/<domain>/{services/,queries/,actions/,components/,mappers/,lib/,types/,utils/,constants.ts,index.ts}`. Keep domain logic inside its module; shared code only in `src/shared/`.
- Reads split by source (strict): **database reads go in `services/`** (`'server-only'`), **external API reads go in `queries/`** (TMDB). Writes go in `actions/` (server actions). A composite read (external + enrichment) lives in `queries/` and calls the `services/` lookup. TMDB mapping lives in `mappers/` (pure, unit-tested with `*.test.ts` next to source).
- `services/` is the DB layer for every module (not just `rewatch/`). It also holds the thin-action→fat-service split. Types live in `types/` as type-only files (`import type` only, **zero runtime code**) — runtime constants go to `<module>/constants.ts` or `lib/`. `src/architecture.test.ts` enforces all of this.
- Naming: PascalCase files for components (`LibraryDetailsShowWatchToggle.tsx`), camelCase for every other module (Next reserves lowercase names such as `page.tsx`/`route.ts`), no kebab-case. One exported function per `services/`/`queries/`/`actions/` file, named after the file; verb-first (`getX`, `listX`, `fetchX`, `markX`, `syncX`, `attachX`, `clearX`) and named for what it does, never a positional boolean (`markShowWatched(showId)`, not `setShowWatched(showId, true)`). Props/types are suffixed by role (`XProps`, `XParams`, `XResult`, `XResponse`, `XView`); booleans read as `is/has/can/should` or a plain state adjective. Domain vocabulary is `movie` / `show` / `season` / `episode` / `notes` / `comments` (reviews are comments in the UI); `'tv'` survives only as the TMDB path segment and the `/library/tv/...` route.
- Comments: server re-extracts mentions with the strict regex (`comments/lib/mentions.ts`); client `mentionIds` is hint-only. Rendered content is JSX-escaped, never raw HTML. Editing a comment re-derives mentions and reconciles `CommentMention`/`Notification` rows in one transaction, so editing a handle out of the text stops the ping. Only the author sees edit/delete controls (`updateComment`/`deleteComment` also enforce ownership server-side). One `Notification` per (recipient, comment) in the same transaction, `@@unique([recipientId, commentId])`, with a `mediaType/tmdbId/mediaTitle` snapshot; self-mentions create none.
- Watch dialogs: any media item already watched (count >= 1 or completed status) opens `WatchActionModal` (episode/season/show/movie) with Rewatch/Unwatch; untouched media is watched on one click. Entry points: show + season badges, episode card toggle, and `RewatchButton` (`Watch (n)` pill in the movie/show actions menu and season header — pass `watched` for items completed via tracking). Unwatch uses `unwatchMedia` → `clearEpisode|Season|Show|MovieWatchHistory` (clears logs + watched flags, keeps tracking rows so ratings survive; a completed movie drops back to Plan to Watch) — never re-implement unwatch with `markShowWatched`/`markSeasonWatched` (they only ever add watches).
- Season rewatch counts are DERIVED (`rewatch/lib/seasonRewatch.ts`): every episode ≥ 4 watches AND at least 2 episodes ≥ 5, then `max(1, lowest - 3)`. Every episode-watch write calls `syncSeasonRewatchCount`; migration `20261104130000_season_rewatch_rule` reconciled old values. Removing a season/show log also deletes the child logs created at the same timestamp.
- Design system: tokens live in `src/app/globals.css` under `@theme` (`--color-canvas`, `--color-surface-elevated`, `--color-primary`, …), consumed by the `glass-*`/`apple-*` utilities. There is one glass language (`.glass-panel` for page-level surfaces, `.glass-card` for content, `.glass-card-interactive` for clickable cards) — no legacy alias layer, no raw hex in components. `:focus-visible` gets a 2px `--color-primary` outline globally, `color-scheme: dark` is set, and a `prefers-reduced-motion` block disables transforms/animations.
- UI states: empty lists use `shared/ui/EmptyState` (dashed glass card, violet icon tile, title + one-line explanation, optional action, `compact` inside popovers) — never a bespoke empty div. Failures use `shared/ui/ErrorState` (product copy, retry, back link, optional `error.digest`); stack traces and diagnostics stay in the console via the boundary's `useEffect`, never on screen. Loading uses `shared/ui/Skeleton`; every data route has a `loading.tsx` (dashboard, library, library details, person, title details, episode, settings/profile).
- Bell: badge capped at `9+` (`aria-live="polite"`), polls on mount/navigation/interval; deep links carry `#comment-<id>` + `?mention=unavailable` for deleted comments (dismissible notice in `PublicReviewsPanel`).
- Media detail pages render ONE tabbed component (`MediaCommentTabs`): Personal Notes (rating + private note list/composer) and Public Reviews. There is no separate notes block above it, and episode cards carry no duplicate "open discussion"/"edit review" buttons — the card itself is the link.
- Server vs client: pages/layouts are Server Components and own primary data loading; `"use client"` belongs on interactive leaves (inputs, dropdowns, modals, toggles). Chrome is split: `Header` is server with `HeaderNav`/`HeaderActions` client leaves, `Footer` is the client nav leaf. The only client-owned data fetch left is `PublicReviewsPanel` pagination — its first page is server-rendered via `initialReviews`. Prisma + TMDB token access are server-only; `services/` files carry `import 'server-only'` (or `'use server'` when a client component calls them directly).
- Imports: use `@/` alias (`@/modules/movie/queries`, `@/infra/db/prisma`). Never import from `generated/` by relative path confusion — canonical import is via `generated/prisma/client`.
- Styling: Tailwind classes + `clsx`; gradients per title via `getGradientForTitle`; skeletons for loading states (`*Skeleton.tsx`, `loading.tsx`).
- Images: always through `next/image` with `image.tmdb.org` remote pattern; base URL from `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL`.
- Errors: throw `ExternalServiceError` subclasses for TMDB (`TmdbApiError` with `retryable` on 429/5xx); shared `src/shared/lib/errors.ts`.
- Revalidation: mutate via server actions then `revalidatePath` (see `src/shared/lib/revalidate.ts`).

## Data model (prisma/schema.prisma)

- `User`: next-auth user + `passwordHash?`; has many `Show[]`, `Movie[]`. (Per-user TMDB token columns removed — single server token now.)
- `Show`: `@@unique([userId, tmdbId])`, seasons/genres/tracking; `Season`: `@@unique([showId, seasonNumber])`; `Episode`: `@@unique([seasonId, episodeNumber])`. All relations `onDelete: Cascade`.
- `Movie`: `@@unique([userId, tmdbId])`, genres/tracking.
- `Genre`: shared `tmdbId @unique`, M-N to shows/movies.
- `ShowTracking`: `PLAN_TO_WATCH/WATCHING/COMPLETED/DROPPED` + added/started/completedAt.
- `MovieTracking`: `PLAN_TO_WATCH/WATCHING/COMPLETED` + rating + added/started/completedAt (no notes column).
- `EpisodeTracking`: watched/watchedAt + rating per episode (no notes column).
- `MediaNote` (`media_notes`): private notes, many per `(user, mediaType, tmdbId)`, soft-deleted. Ratings live only on the tracking rows — `media/actions/setMediaRating` writes them and never touches notes. Legacy `MovieTracking.notes` / `EpisodeTracking.notes` were backfilled into `media_notes` and dropped (migration `20261104120000_media_notes`).
- `RewatchLog` (`rewatch_logs`): one row per logged watch, polymorphic by `media_type` + `media_id` **and** typed FKs (`show_id`/`season_id`/`episode_id`/`movie_id`) for cascades. A DB CHECK (`rewatch_logs_pointer_matches_media_type`, migration `20261104160000`) enforces that `media_id` equals the deepest typed id, that the branch matches `media_type`, and that parent ids are set (episode rows carry show+season, season rows carry show).
- Integrity constraints from `20261104160000_schema_integrity`: ratings CHECK 1-5 on both tracking tables, non-blank `content` on `comments`/`media_notes`, non-negative attachment `size_bytes` and positive dimensions. Prisma cannot express CHECKs — they live in the migration and must be re-added by hand in any future reset.
- Indexing: no per-column `userId` index on `Show`/`Movie` (the `@@unique([userId, tmdbId])` covers the prefix). `Episode(airDate, episodeNumber)` serves the upcoming/up-next scans (was a full seq scan). Cursor-paginated feeds index the tiebreak: `comments(media_type, tmdb_id, created_at, id)` and `notifications(recipient_id, is_read, created_at, id)` — both support a backward index scan, no sort.
- Denormalized counters: `rewatch_count` on Show/Season/Episode/Movie is derived from `rewatch_logs` (season via the Task 13 rule); progress uses stored episodes, not TMDB's `numberOfEpisodes`, because that snapshot drifts from the rows (3 shows currently disagree) and pushed the progress bar past 100%.
- Auth tables: `Account`, `Session`, `VerificationToken` (standard PrismaAdapter shape).
- Config: `prisma.config.ts` selects `DATABASE_URL` vs `DEMO_DATABASE_URL` by `PRISMA_TARGET=personal|demo`.
- Comment attachments: one `StorageProvider` (`src/infra/storage/types.ts`) with two backends — S3-compatible object storage when `S3_BUCKET` is set (`s3Storage.ts`, AWS/R2/MinIO/B2), local disk otherwise (`COMMENT_STORAGE_DIR`, default `.data/comment-uploads`, untracked + CWD-relative, dev only). Always resolve through `getCommentStorage()`; never reintroduce the removed `storage` singleton or presigned-upload stub. Uploads return `{key,url}`; `createComment` and `/api/comments/attachments` only accept keys/URLs this deployment minted (`isCommentAttachmentKey` / `isCommentAttachmentUrl`), and derive the stored URL server-side. Migration drift: `20261030120000_public_reviews` was edited after apply, so `migrate dev` demands a reset — use `migrate deploy`. `chronicle_test` is mid-chain stale; prove migrations on a scratch DB first.
- Locked decisions (`docs/execution-plan.md` Phase 0): app AES-GCM tokens-only encryption, AWS S3, notes tables for episodes + movies with standalone rating, keep standalone rewatch counter, strict queries/actions layout.

## Critical flows

- Add to library: `library/services/addMedia.ts` (+ `addMediaAction`) -> `show/actions/addShow.ts` or `movie/actions/addMovie.ts` — fetches TMDB details, creates Show/Movie + Season/Episode rows + Tracking row (`PLAN_TO_WATCH` default).
- Show progress: `show/utils/getShowProgress.ts`, `shouldSyncShow.ts` decides TMDB re-sync (`lastSyncedAt`); `syncShow.ts` refreshes seasons/episodes.
- Episode tracking: `toggleEpisodeWatched.ts`, `setSeasonWatched.ts` -> `EpisodeTracking` + show status roll-up. Rating is separate (`media/actions/setMediaRating`).
- Movie tracking: `updateMovieTrackingStatus.ts`, `media/actions/setMediaRating`, `deleteMovieFromLibrary.ts` (cascade). Notes go through `notes/actions/*`, not the tracking rows.
- Discovery: search/trending/similar/credits/person via `tmdbFetch` / `tmdbFetchForUser` (both resolve the single server `TMDB_ACCESS_TOKEN`); mappers normalize TMDB shapes to app types.
- Auth: Google if `AUTH_GOOGLE_ID/SECRET` set; email/password via Credentials + bcrypt; guest via `GUEST_LOGIN_ENABLED=true` + shared `DEMO_USER_EMAIL` account. No onboarding token step — `proxy.ts` is auth-only.
- Demo reset: `GET /api/reset-demo` reseeds demo DB (cron Mon/Thu, see `.github/workflows/`).

## Env keys (see .env.development; secrets gitignored)

`DATABASE_URL, DATABASE_USER/PASSWORD/DB, DEMO_DATABASE_URL, PRISMA_TARGET=personal|demo, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL, NEXT_PUBLIC_TMDB_IMAGE_BASE_URL, TMDB_ACCESS_TOKEN (single server token; DEMO_TMDB_TOKEN kept as legacy fallback), DEMO_USER_EMAIL, GUEST_LOGIN_ENABLED, AUTH_SECRET, AUTH_TRUST_HOST, AUTH_GOOGLE_ID/SECRET`

## Future / parked (come back later)

- TMDB scale-up (single token is fine into the hundreds of users; limit is ~40 req/s per IP, not per token): DB-backed TMDB response cache (ToS allows up to 6 months TTL), `append_to_response` to collapse season/credit fetches into detail calls, request queue for `addShow` bursts. Per-user BYO token override only if quota ever demands it.

## Do / Don't

- DO scope every Show/Movie query by `userId` (`@@unique([userId, tmdbId])`); never leak cross-user library rows.
- DO use `tmdbFetch` / `tmdbFetchForUser` for all catalogue reads (single server token, server-only).
- DO keep mappers pure and covered by colocated `*.test.ts`; run `npm test` after mapper/tracking changes.
- DO run `npx prisma migrate dev` + `npx prisma db seed` after schema changes; keep migrations in `prisma/migrations/`.
- DON'T edit `generated/`, `.next/`, `node_modules/`.
- DON'T commit `.env*` (only `.env.development` with dev credentials is tracked); DON'T log the server TMDB token or plaintext passwords.
- DON'T call TMDB from client components — always through server queries/actions.

## Verification

- `npx tsc --noEmit` (strict, bundler resolution, `@/*` alias)
- `npm run lint`
- `npm test` (Vitest + jsdom, `src/**/*.test.{ts,tsx}`) — includes `src/architecture.test.ts` (types-only rule, services/queries split, no client pages, no Prisma in client components)
- `npm run build` — if it fails on `next/font/google` after a refactor, `rm -rf .next` and rebuild before suspecting the diff (stale Turbopack cache)
- For DB/auth changes: `docker compose up -d`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`, smoke-test login/guest -> search -> add show/movie -> toggle episode -> library filters -> dashboard stats.
- Integration suites (real Postgres): `createdb chronicle_rw_test` (name MUST end in `_test`), `DATABASE_URL=postgresql://…/chronicle_rw_test?schema=public npx prisma migrate deploy`, then the same URL with `INTEGRATION_DB=1 npx vitest run src/modules/rewatch`. That flag switches Vitest to `fileParallelism: false, maxWorkers: 1` because the suites share one database and truncate between tests. `cascade.integration.test.ts` holds the two `it.fails` cases that reproduce the timestamp-identity cascade bug until WP-04 lands.
- CI (`.github/workflows/ci.yml`): tsc, lint, unit tests, `migrate deploy` on Postgres 17, `prisma migrate diff --from-config-datasource --to-schema --exit-code` (fails when a schema change has no migration), the integration suites, then the build with its documented advisory retry.
- Logging: `src/infra/logging/logger.ts` — `logError`/`logWarn`/`logInfo` emit one JSON line with `event`, `action`, `route`, optional `digest`, and a redacted `meta`/`error`. Never `console.error` directly; sensitive keys and bodies are filtered, messages truncated to 300 chars.
