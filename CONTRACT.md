# Chronicle API v1 Contract

Backend-agnostic REST contract for the React Native app. Any backend
implementing this file byte-for-byte (including the current Next.js one and
the future Java one) serves the mobile app with zero mobile changes.

Base URL: `{API_BASE_URL}/api/v1`. All bodies and responses are JSON.

## Authentication

Mobile auth is **Bearer JWT**, independent of the web cookie session.

* Scheme: `Authorization: Bearer <token>`
* JWT: `alg HS256`, claims `{ sub: userId, email, iss: "chronicle", iat, exp }`
  (30-day expiry), key `SHA-256("chronicle-mobile-jwt:" + AUTH_SECRET)`.
* Every endpoint except `POST /auth/register`, `POST /auth/login`,
  `POST /auth/guest` requires the header. Missing/invalid → `401 UNAUTHORIZED`.

## Envelope

Success: `{ "ok": true, ...data }` (HTTP 200, 201 on create).

Failure: `{ "ok": false, "error": "<human message>", "code": "<CODE>" }`.

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Bad input |
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | No/bad auth |
| 403 | `GUEST_DISABLED` | Guest login off |
| 404 | `NOT_FOUND` | Not in library / unknown id |
| 409 | `EMAIL_TAKEN` | Register with existing email |
| 428 | `TMDB_TOKEN_MISSING` | User has no TMDB token saved |
| 500/502/503 | `APP_ERROR` / `EXTERNAL_SERVICE_ERROR` / `DATABASE_ERROR` | Server/TMDB/DB failure |

Dates are ISO-8601 strings. IDs: database ids are UUID strings (`showId`,
`episodeId`, `movieId`); catalogue ids are TMDB integers (`tmdbId`).

## Endpoints

### Auth
* `POST /auth/register` `{ email, password>=8 }` → `201 { token, user }`
* `POST /auth/login` `{ email, password }` → `200 { token, user }`
* `POST /auth/guest` `{}` → `200 { token, user }` (shared demo account; 403 when disabled)
* `GET /auth/me` → `{ user, hasTmdbToken, tmdbTokenUpdatedAt }`

### TMDB token (per user, validated live against TMDB before save)
* `GET /tmdb-token` → `{ configured, updatedAt }`
* `PUT /tmdb-token` `{ token }` → `{ masked: "••••abcd" }`
* `DELETE /tmdb-token` → `{}`

### Dashboard
* `GET /dashboard` → `{ shows, movies, upNext, upcomingEpisodes, upcomingMovies, trendingShows, trendingMovies }`

### Library
* `GET /library/shows?sort&status&search` → `{ shows }`
* `GET /library/movies?sort&status&search` → `{ movies }`
  * `sort`: `recent|title|year` · `status`: `all|watching|plan_to_watch|completed|dropped`
* `GET /library/:type(movie|tv)/:tmdbId` → `{ media }` (404 when untracked)
* `POST /library/:type/:tmdbId` `{ status? }` → `201 { media }` (idempotent)
  * movie `status`: `PLAN_TO_WATCH|WATCHING|COMPLETED`
  * show `status`: `PLAN_TO_WATCH|WATCHING|COMPLETED|DROPPED`
* `PATCH /library/:type/:tmdbId` `{ status }` → `{}` (show statuses limited by server rules)
* `DELETE /library/:type/:tmdbId` → `{}`
* `POST /library/tv/:tmdbId/sync` → `{}` (refresh from TMDB)

### Episodes & logs
* `POST /episodes/toggle` `{ showId, episodeId }` → `{}`
* `POST /seasons/watched` `{ showId, seasonId, watched }` → `{}`
* `POST /shows/watched` `{ showId, watched }` → `{}`
* `POST /logs/movie` `{ movieId, rating 0-5, notes? }` → `{}`
* `POST /logs/episode` `{ episodeId, rating 0-5, notes? }` → `{}`

### Discovery (all require the caller's saved TMDB token)
* `GET /discovery/search?query=` → `{ results }`
* `GET /discovery/trending/shows` → `{ shows }`
* `GET /discovery/trending/movies` → `{ movies }`
* `GET /discovery/upcoming/movies?days=` → `{ movies }`
* `GET /discovery/upcoming/episodes?days=` → `{ episodes }`
* `GET /discovery/up-next` → `{ episodes }`
* `GET /discovery/similar?mediaType=movie|tv&id=` → `{ similar }`
* `GET /discovery/credits?mediaType=movie|tv&id=` → `{ credits }`
* `GET /discovery/person/:id` → `{ person, combinedCredits }`

## Backend notes (quota & behavior)

* TMDB reads are cached server-side (24h trending Genres, 7d similar/credits),
  concurrent identical GETs are deduplicated, and 429/5xx responses are
  retried with `Retry-After` backoff (max 3 attempts). Reimplement at least
  the backoff when porting.
* `GET` detail for shows refreshes stale data from TMDB (best-effort).
* Tracked-entity shapes are the Prisma models serialized to JSON.
