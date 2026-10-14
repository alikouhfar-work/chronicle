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
src/modules/episode-season/ # up-next/upcoming queries, toggleEpisodeWatched/setSeasonWatched actions
src/modules/library/        # library cards/filters/details (incl. LibraryDetailsShareButton in details header), services/addMedia, actions/addMediaAction
src/modules/media/          # shared entities, queries, tracking helpers, tmdb mappers (mappers.ts, tracking.ts)
src/modules/movie/          # queries/getTracked|Trending|Upcoming|Similar, actions/add|delete|updateStatus|addLog
src/modules/show/           # queries/getTracked|Fresh|Trending|Similar, actions/add|sync|setWatched|delete|updateStatus
src/modules/auth/           # LoginForm, SignupForm
src/infra/db/prisma.ts       # singleton PrismaClient via PrismaPg (PRISMA_TARGET personal|demo)
src/infra/auth/auth.ts       # NextAuth config (google/credentials/guest, PrismaAdapter, jwt)
src/infra/tmdb/client.ts     # tmdbFetch (single server token, retry 3x, backoff, GET dedupe, 24h cache)
src/infra/tmdb/forUser.ts    # requireUserId + tmdbFetchForUser alias (delegates to tmdbFetch, no per-user token)
src/infra/tmdb/images.ts     # image URL helpers (TMDB_IMAGE_BASE_URL)
src/shared/lib/             # formatMinutes, getDaysUntilAirDate, errors, validate, navigation, toast (custom AppToast helpers), revalidate
src/shared/ui/ hooks/ types/ # shared UI incl. AppToast (glass-card hot-toast card), usePWAInstall/useQueryString/useServerAction/useWatchStats
prisma/schema.prisma        # Show, Movie, Season, Episode, Genre, Show/Movie/EpisodeTracking, User/Account/Session
                             # Show/Movie: @@unique([userId, tmdbId]); Season: @@unique([showId, seasonNumber]) + @@index([tmdbId]); Episode: @@unique([seasonId, episodeNumber]) + @@index([tmdbId]) — Season/Episode tmdbId is NOT globally unique (multi-user)
prisma/seed.ts              # trending seed with randomized tracking statuses
generated/prisma/           # generated client — never hand-edit
```

## Conventions

- Module layout: `src/modules/<domain>/{queries/,actions/,components/,mappers/,lib/,types/,utils/,index.ts}`. Keep domain logic inside its module; shared code only in `src/shared/`.
- Reads go in `queries/`, writes in `actions/` (server actions). TMDB mapping lives in `mappers/` (pure, unit-tested with `*.test.ts` next to source).
- Server vs client: Prisma + TMDB token access are server-only. Client components (`"use client"`) only for interactive UI (filters, toggles, log modals, PWA install).
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
- `MovieTracking`: `PLAN_TO_WATCH/WATCHING/COMPLETED` + rating/notes + added/started/completedAt.
- `EpisodeTracking`: watched/watchedAt + rating/notes per episode.
- Auth tables: `Account`, `Session`, `VerificationToken` (standard PrismaAdapter shape).
- Config: `prisma.config.ts` selects `DATABASE_URL` vs `DEMO_DATABASE_URL` by `PRISMA_TARGET=personal|demo`.

## Critical flows

- Add to library: `library/services/addMedia.ts` (+ `addMediaAction`) -> `show/actions/addShow.ts` or `movie/actions/addMovie.ts` — fetches TMDB details, creates Show/Movie + Season/Episode rows + Tracking row (`PLAN_TO_WATCH` default).
- Show progress: `show/utils/getShowProgress.ts`, `shouldSyncShow.ts` decides TMDB re-sync (`lastSyncedAt`); `syncShow.ts` refreshes seasons/episodes.
- Episode tracking: `toggleEpisodeWatched.ts`, `setSeasonWatched.ts`, `addEpisodeLog.ts` (rating/notes) -> updates `EpisodeTracking` + show status roll-up.
- Movie tracking: `updateMovieTrackingStatus.ts`, `addMovieLog.ts` (rating/notes), `deleteMovieFromLibrary.ts` (cascade).
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
- `npm test` (Vitest + jsdom, `src/**/*.test.{ts,tsx}`)
- `npm run build`
- For DB/auth changes: `docker compose up -d`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`, smoke-test login/guest -> search -> add show/movie -> toggle episode -> library filters -> dashboard stats.
