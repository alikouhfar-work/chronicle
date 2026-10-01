# Chronicle

Your personal movie and TV show tracker. Track what you're watching, log episodes and movies, and keep a searchable archive of everything — powered by [TMDB](https://www.themoviedb.org/).

Built with Next.js App Router, Prisma + PostgreSQL, and Tailwind CSS. Installable as a PWA.

## Features

- **Dashboard** — watch stats header, up-next episodes, trending shows/movies, upcoming episodes and movies
- **Library** — personal collection of tracked movies and shows with status, sort, and type filters
- **Show tracking** — `PLAN_TO_WATCH` / `WATCHING` / `COMPLETED` / `DROPPED`, per-season and per-episode progress
- **Movie tracking** — `PLAN_TO_WATCH` / `WATCHING` / `COMPLETED`, with ratings and notes
- **Episode tracking** — watched state, ratings, and notes per episode
- **Details pages** — seasons, cast, similar titles, and activity log for each library item
- **Discovery** — TMDB-backed search, trending, similar titles, credits, and person pages
- **PWA** — web manifest, service worker registration, and install prompt for standalone use

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Database | PostgreSQL 17, Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| Data source | TMDB API v3 (server-side fetch, `next/image` remote patterns for `image.tmdb.org`) |
| Styling | Tailwind CSS 4, `clsx` |
| UI extras | `@tabler/icons-react`, `react-hot-toast`, `date-fns` |
| Testing | Vitest 5 + Testing Library + jsdom |
| Tooling | ESLint, Prettier (+ `prettier-plugin-tailwindcss`), `tsx` |

## Project Structure

```
src/
  app/
    (main)/                 # Dashboard, library, search, person routes
    api/                    # Route handlers (e.g. demo reset)
    layout.tsx              # Root layout, fonts, metadata
    manifest.ts             # PWA manifest
    globals.css
  modules/
    dashboard/              # Watch-stats header
    discovery/              # Search / discovery UI
    episode-season/         # Up-next, upcoming episodes, season/episode logic
    library/                # Library pages, cards, filters, details views
    media/                  # Shared media entities, TMDB client, mappers
    movie/                 # Movie queries, actions, components
    show/                  # Show queries, actions, components
  infra/
    db/prisma.ts            # Prisma client singleton
    tmdb/                   # TMDB fetch helpers
  shared/
    lib/                    # Formatting, validation, errors, navigation utils
    ui/                     # Shared UI (buttons, skeletons, PWA components)
    hooks/ types/
prisma/
  schema.prisma             # Show, Movie, Season, Episode, Genre, tracking models
  migrations/
  seed.ts                   # Seeds trending TMDB titles with random tracking statuses
```

Module convention: each domain module exposes `queries/` (reads), `actions/` (server actions / writes), `components/`, `mappers/`, `lib/`, and `types/`.

## Prerequisites

- Node.js 20+ (or [Bun](https://bun.sh/))
- Docker + Docker Compose (for local PostgreSQL)
- A TMDB read-access token from https://www.themoviedb.org/settings/api

## Getting Started

1. Install dependencies:

```bash
npm install
# or
bun install
```

2. Configure environment. Required variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5434/chronicle"
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_DB=chronicle

TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
TMDB_ACCESS_TOKEN=<your-tmdb-read-access-token>

# Only needed for the demo database target
PRISMA_TARGET=personal          # or "demo"
DEMO_DATABASE_URL=...           # required when PRISMA_TARGET=demo
```

3. Start PostgreSQL:

```bash
docker compose up -d
```

The compose file maps container port `5432` to host `5434` (`chronicle-db`, health-checked with `pg_isready`).

4. Run migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

The seed script (`prisma/seed.ts`, run via `tsx`) clears existing data, fetches trending movies/shows from TMDB, and adds 5 of each with randomized tracking statuses.

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running with Docker

The compose stack runs PostgreSQL plus the Next.js app (standalone build). The app container applies migrations on startup (`prisma migrate deploy`).

```bash
# Build and start db + app
docker compose up --build

# Or detached
docker compose up -d --build
```

- App: [http://localhost:3000](http://localhost:3000) (`chronicle-app`)
- DB: `localhost:5434` (`chronicle-db`, data persisted in the `db` volume)

Inside the compose network the app reaches the db as `postgres:5432` — the compose file overrides `DATABASE_URL` accordingly, so no local env change is needed.

```bash
# Follow app logs
docker compose logs -f app

# Seed the containerized db (trending TMDB titles)
docker compose exec app npx prisma db seed

# Stop / tear down (add -v to also drop the db volume)
docker compose down
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest suite once (`vitest run`) |
| `npm run test:watch` | Run Vitest in watch mode |

Tests live next to source as `src/**/*.test.{ts,tsx}` (see `vitest.config.ts`, path alias `@` → `src/`).

## Database

- Schema: `prisma/schema.prisma` — `Show`, `Movie`, `Season`, `Episode`, `Genre`, plus `ShowTracking`, `MovieTracking`, `EpisodeTracking` (cascade deletes throughout).
- Config: `prisma.config.ts` selects `DATABASE_URL` or `DEMO_DATABASE_URL` based on `PRISMA_TARGET`.
- Migrations: `prisma/migrations/`
- Demo reset: `.github/workflows/reset-demo.yml` hits `/api/reset-demo` on a cron schedule (Mon/Thu) to reseed the demo deployment.

## Deployment

Standard Next.js deployment (e.g. Vercel). Set all env vars above plus a reachable `DATABASE_URL`, run `prisma migrate deploy`, then `next build` / `next start`. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for platform details.
