# Chronicle — Phased Execution Plan

Derived from the raw requirements list, grounded in the actual codebase at
`Desktop/Projects/Personal/chronicle` (Next.js 16 App Router, React 19,
Prisma 7 + Postgres 17 via Docker on host port 5434, NextAuth v5, TMDB
server-side only, Tailwind 4, Vitest). Conventions: `src/modules/<name>/`
with `actions/` (writes), `queries/` (reads), `mappers/`, `types/`;
path alias `@/*` → `./src/*`; commands run from project root
(`npm run dev|build|lint`, `npm test`, `npx prisma migrate dev`).

> Answer to raw item 14 (question, not a task): under the current logic the
> season `rewatchCount` is a **standalone counter, never derived** from
> episodes (`src/modules/rewatch/services/rewatchService.ts`: episode
> rewatches bump only the episode; season rewatches cascade top-down).
> So all-episodes-≥4× with two at 5× via episode watches ⇒ **season
> rewatchCount = 0**. Phase 5 asks you to confirm whether to keep this or
> switch to derived semantics.

Conventions used below: each phase lists **Goal → Tasks (with exact files)
→ Verify → Checkpoint** (pause and ask). Sizes: S <½d, M ½–2d, L >2d.

> **Phase 0 decisions (locked 2026-11-03):**
> - 0.1 Encryption: **app-level AES-GCM, tokens only** (`Account`
>   refresh/access/id tokens, `Session.sessionToken`,
>   `VerificationToken.token`). Email/content/notes deferred.
> - 0.2 Object storage: **AWS S3** (local disk stays for dev).
> - 0.3 Rating/notes: **notes tables for episodes + movies, rating
>   standalone** on the tracking rows.
> - 0.4 Rewatch: **keep standalone counter** (no derivation).
> - 0.5 Layout: **strict queries/actions, fold outliers in**.
> Phases below proceed on these answers.

---

## Phase 0 — Decisions & guardrails (S)

Goal: lock the ambiguous/complex choices before code moves.

- [ ] 0.1 Confirm encryption scope (raw #1): app-level AES-GCM with a new
      `DATA_ENCRYPTION_KEY` vs Postgres pgcrypto/TDE. Candidate columns:
      `Account.refresh_token/access_token/id_token`,
      `Session.sessionToken`, `VerificationToken.token`, `User.email`,
      `Comment.content`, `MovieTracking.notes`, `EpisodeTracking.notes`.
      Passwords already bcrypt (`src/infra/auth/actions.ts:27`) — out of scope.
- [ ] 0.2 Confirm object-storage target (raw #15): S3/R2/MinIO/Cloudflare —
      needs credentials + bucket; local disk (`.data/comment-uploads/`,
      `src/infra/storage/storage.ts`) stays for dev. Note: serving route
      `src/app/api/comments/files/[...key]/route.ts` is currently public.
- [ ] 0.3 Confirm rating/notes data model (raw #11): new `EpisodeNote`
      (1-to-many) table + standalone rating on `EpisodeTracking`? Same for
      movies? Migration + backfill of existing `notes` text.
- [ ] 0.4 Confirm rewatch semantics (raw #14): keep standalone season
      counter (answer: 0) vs derive from episodes (e.g. min across episodes)
      vs hybrid. Changing it alters `rewatchService.ts` record/remove paths.
- [ ] 0.5 Confirm canonical module layout (raw #4): reads → `queries/`,
      writes → `actions/` (SKILL.md convention), TMDB mapping → `mappers/`;
      `services/` only where a thin-action→fat-service split already exists
      (`rewatch/`). Decide fate of `library/services/addMedia.ts`
      (orchestrator) and `media/` flat files.

**Checkpoint — pause and ask:** 0.1–0.5 are all blocking choices. Do not
start Phase 1 without answers.

---

## Phase 1 — Project skill (S, raw #2)

Goal: durable agent knowledge of this repo (a root `SKILL.md` already
exists — extend, don't duplicate).

- [ ] 1.1 Read root `SKILL.md` (`chronicle-frontend`) + `prisma/schema.prisma`
      + `src/infra/*` and record: module layout, server-actions pattern,
      TMDB-via-`forUser` rule, test/lint/build commands.
- [ ] 1.2 Save as a profile skill (so it loads on any future task):
      module map, where DB reads/writes live per module, `?tab=` patterns,
      `mention=unavailable` + `#comment-<id>` deep-link contract,
      `.data/` untracked quirk, `chronicle_test` migration drift (see Phase 6).
- [ ] 1.3 Verify: skill loads by name on a fresh probe task.

---

## Phase 2 — Structural normalization (L, raw #4 + #5)

Goal: every module shaped alike; all shared types in `types/` files.

- [ ] 2.1 Module layout (raw #4). Target per module:
      `actions/` writes, `queries/` reads, `components/`, `types/`,
      `lib/` (pure helpers), `mappers/` (TMDB mapping). Concrete moves:
  - `comments/`: move `services/listComments.ts`, `getCommentById.ts` →
    `queries/` (only module with reads in two places); keep writes in
    `services/` or rename to `actions/` per 0.5.
  - `notifications/`: split `services/notifications.ts` reads →
    `queries/`, keep `updateMany` writes; rename singular `types.ts` → `types/`.
  - `rewatch/`, `user/`: single home for writes (`userService.ts` vs
    `actions/updateUsername.ts` — pick one).
  - `media/`: create `queries/`, `types/`; move raw/view types out of
    `entities.ts`, `tmdb.ts`, `queries.ts`, `tracking.ts`.
  - `api/`: create `types/` for `ApiSession`, `ApiErrorBody`.
  - Unify the two TMDB import paths (`@/infra/tmdb/forUser` vs `/client`)
    in `discovery/search/queries/getSearchPreview.ts`,
    `movie/actions/addMovie.ts`, `show/actions/syncShow.ts`.
- [ ] 2.2 Types extraction (raw #5 — types files hold types only, no values).
      Move: `CreateCommentInput` (`comments/actions/createComment.ts`),
      `CommentAttachment` (`comments/components/CommentImageGrid.tsx`),
      panel props (`PersonalNotesPanel`, `PublicReviewsPanel`),
      `TitleDetailsViewProps`, `SearchPreview` (merge with
      `SearchResultResponse`), `TrackedEpisodeDetails`, `SharePayload`
      (`library/lib/buildShareMessage.ts`), `ShowLifecycle`,
      `SeasonSegment`/`ShowPosition`, rewatch `*Props` → `types/rewatch.ts`,
      `UsernameState`, `PublicUser` (`user/lib/publicUser.ts` — imported
      cross-module). Keep local: `FeedStatus`, `CommentRecordShape`,
      `DateLike`, `RewatchLogCreateData`, `PendingAction`, `ShareState`,
      `*StatusFilter` props already in `types/`. Replace
      `CommonTrackingStatus` with the Prisma enum import.
- [ ] Verify: `npm run lint`, `npm test`, `npm run build` green; no import
      cycles (`@/*` only, no `../../` escapes introduced).

**Checkpoint — pause and ask:** 2.1 changes ~13 modules; confirm the 0.5
layout decision file-by-file if any module resists the pattern.

---

## Phase 3 — UI consistency (M, raw #3, #6, #8, #9)

Goal: one back button, sign-out in profile, no duplicated note editors,
lean episode cards.

- [ ] 3.1 Back buttons (raw #3). Today 4 variants:
      `library/components/details/LibraryDetailsNavigation.tsx` (Link,
      ChevronLeft, pill), `discovery/person/.../PersonDetailsBackButton.tsx`
      (button + `router.back()`), episode page `[...]/page.tsx:56-62`
      (Link, ArrowLeft, bordered pill), profile page (plain text link).
      Create one shared component (e.g. `src/shared/ui/BackButton.tsx`,
      Link-based with `href` prop + ChevronLeft pill) and replace all four;
      keep `error.tsx` boundary path as-is.
- [ ] 3.2 Sign-out in profile (raw #6). Move/replicate the header sign-out
      (`src/shared/ui/Header.tsx:26-30,113-121`, `signOut({redirectTo:'/login'})`)
      into `src/app/(main)/settings/profile/page.tsx` (currently avatar +
      `UsernameForm` only). Decide: move vs duplicate (header keeps it?).
- [ ] 3.3 Movie notes dedupe (raw #8). `LibraryDetails.tsx:76` renders
      standalone `<LibraryDetailsMovieLog>` ("Your Review & Thoughts") AND
      `:78-85` renders `<MediaCommentTabs>` with a Personal Notes tab —
      movie-only duplication. Remove the standalone card; route all editing
      through the tab's editor. TV (`:77` seasons list) and episode
      (editor-in-tabs, `episode/[episodeId]/page.tsx:142-151`) are the
      reference shapes.
- [ ] 3.4 Episode card cleanup (raw #9).
      `episode-season/components/ShowDetailsEpisodeCard.tsx:115-142`:
      remove the "Open episode discussion" Link (`:117-124`) and the
      watched-only "Edit review" button (`:131-140`, `setIsEditingEpisodeLog`
      → `LibraryDetailsLogModal`); the card body Link (`:69-73`) already
      opens details + discussion. Keep `RewatchHistoryButton` + watch toggle.
- [ ] Verify: `npm run lint`, `npm test`, `npm run build`; click-through
      library → movie/tv/episode/person/profile back buttons.

**Checkpoint — pause and ask:** 3.2 (move vs duplicate sign-out) and 3.3
(data migration: none needed — same `MovieTracking` row — but confirm no
standalone-card-only features are lost).

---

## Phase 4 — Comments, mentions, ratings (L, raw #7, #10, #11)

Goal: chip-styled mentions, full edit/delete with ownership, ratings
decoupled from notes.

- [ ] 4.1 Mention chips (raw #7). Mentions render as plain text today
      (`PublicReviewsPanel.tsx:540-542` `{comment.content}`; `CommentView`
      has no mentions field, `toCommentView.ts:37-43` drops them). Add a
      renderer (chip pill for `@username` using `CommentMention` rows or the
      strict regex in `comments/lib/mentions.ts`), reuse in
      `PublicReviewsPanel` + `PersonalNotesPanel.tsx:140-143`. No `dangerouslySetInnerHTML` — JSX escape stays.
- [ ] 4.2 Edit/delete for own content (raw #10). Backend exists with
      ownership checks (`services/updateComment.ts`, `deleteComment.ts`;
      soft-delete via `deletedAt`, filtered in `listComments.ts:38-42`) but
      **zero UI**: add per-comment edit/delete buttons for the author in
      `PublicReviewsPanel.tsx:492-551`, wire the existing services, and
      **re-extract mentions on edit** (today `updateComment:46-49` updates
      only `content`, leaving `CommentMention`/notification rows stale).
      Personal notes: add real delete (today only overwrite via `editor`
      prop, or whole-row delete via untoggle-watched in
      `toggleEpisodeWatched.ts:36-37`).
- [ ] 4.3 Decouple episode rating from notes (raw #11). Today one
      `EpisodeTracking` row couples `rating?` + `notes?`
      (`schema.prisma:169-179`); every `addEpisodeLog.ts:27-63` save forces
      `watched:true`. Per 0.3: migrate to standalone rating + 1-to-many
      notes; allow rating without note, multiple notes per episode; update
      `EpisodePersonalNotesEditor.tsx` and `MediaCommentTabs` wiring
      (`personalNotes`, `personalNotesEditor` props,
      `types/mediaCommentTabs.ts:18-22`).
- [ ] Verify: unit tests for chip renderer, edit re-extraction, ownership
      (author vs non-author vs signed-out), multi-note CRUD; `npm run lint`,
      `npm test`, `npm run build`.

**Checkpoint — pause and ask:** 4.3 schema shape (new table name/columns,
backfill of existing `notes` strings) before writing the migration.

---

## Phase 5 — Watch-button parity (M, raw #12, #13, #14)

Goal: show/season watch buttons behave like the episode one.

- [ ] 5.1 Show watch parity (raw #12).
      `LibraryDetailsShowWatchToggle.tsx:14-44` is boolean-only
      (`setShowWatched`). Add the episode-style modal
      (`EpisodeActionModal.tsx:43-85` pattern): watched show → ask
      Rewatch (→ `recordShowRewatch`, cascades show+seasons+episodes,
      `rewatchService.ts:321-413`) vs Unwatch.
- [ ] 5.2 Season watch parity (raw #13).
      `LibraryDetailsSeasonActions.tsx:27-58` (`setSeasonWatched` boolean).
      Same modal treatment: Rewatch (→ `recordSeasonRewatch :248-319`,
      season+episodes cascade + logs) vs Unwatch/Clear.
- [ ] 5.3 Rewatch-count semantics (raw #14). Per 0.4: either document
      "standalone counter" (no code) or implement derivation + fix the
      asymmetric `removeRewatchLog` (`:520-609`, episode-log deletion
      doesn't touch season counters).
- [ ] Verify: tests for cascade counts and modal branches; full suite green.

**Checkpoint — pause and ask:** 5.3 semantics + whether Unwatch on
show/season deletes tracking rows (episode precedent:
`toggleEpisodeWatched.ts:36-37` deletes incl. rating/notes — destructive).

---

## Phase 6 — Data & platform hardening (L, raw #1, #15, #16)

Goal: encrypted sensitive columns, real object storage, server-first
rendering. Do last — it cuts across everything above.

- [ ] 6.1 Encryption at rest (raw #1, per 0.1). No crypto module exists
      (`src/infra/` = `auth/ db/ email/ storage/ tmdb/`). Add
      `src/infra/crypto/` (AES-GCM, `DATA_ENCRYPTION_KEY`), encrypt on write
      / decrypt on read at the service boundary for the 0.1 column set.
      Watch out: `User.email` is a lookup key (needs deterministic encryption
      or blind index); OAuth `Account` tokens are `@db.Text`. Migration:
      backfill-encrypt existing rows. Note: seed comment
      (`prisma/seed.ts:83`) claiming "(server token stored encrypted)" is
      stale — fix or remove it.
- [ ] 6.2 Object storage (raw #15, per 0.2). Replace `localStorage`
      (`src/infra/storage/storage.ts:26-52`, `.data/comment-uploads/`,
      untracked + unignored + unmounted in Docker) with the chosen backend;
      implement the stubbed `generatePresignedUploadUrl` (`:32-39`, route
      `/api/comments/uploads/…` doesn't exist) or remove it; fix trust of
      client-supplied `url`/`mimeType` in
      `src/app/api/comments/attachments/route.ts:18-59`; delete files on
      comment delete (today only DB rows cascade); add `.data/` to
      `.gitignore`; add the service to `docker-compose.yml` if self-hosted.
- [ ] 6.3 Server components first (raw #16). Push `'use client'` to leaves:
      `PersonalNotesPanel.tsx` (no hooks — drop directive outright),
      `LibraryShow/MovieStatusChangeButton` (thin wrappers),
      `LibraryDetailsSkeleton.tsx` (replace `useParams` with a `mediaType`
      prop); split `MediaCommentTabs.tsx` (server shell + client tab
      switcher), `PublicReviewsPanel.tsx` (572 lines — server initial feed +
      client composer/pagination islands), `ShowDetailsEpisodeCard.tsx` /
      `LibraryDetailsSeasons.tsx` (server card + client modal/toggle
      islands). Keep genuinely interactive leaves client (forms, modals,
      `NotificationBell`, `RewatchButton`, `MentionComposerTextarea`).
- [ ] Verify: `npm run lint`, `npm test`, `npm run build`; storage tested
      against the real backend in `docker compose`; encrypted columns
      probed at the SQL level (ciphertext on disk, plaintext via services).

**Checkpoint — pause and ask:** 6.1 key management/rotation story and 6.2
provider + bucket + credentials before provisioning anything.

---

## Standing verification (every phase)

1. `npm run lint` clean (notably `react-hooks/set-state-in-effect`).
2. `npm test` — full suite (currently 37 files / 173 passed / 12 skipped).
3. `npm run build` — no prerender/type errors.
4. Migrations proven on a scratch DB (`createdb …_check`, `migrate deploy`,
   backfill spot-check, drop) before touching the dev DB.
5. Known pre-existing quirk: local `chronicle` DB has migration drift
   (`20261030120000_public_reviews` edited after apply) so `migrate dev`
   wants a reset — use `migrate deploy` for applying, or `migrate reset`
   only if local data is disposable. Same for `chronicle_test`.

## Suggested execution order

0 → 1 → 2 → 3 → 4 → 5 → 6 (each phase commits separately; never mix
structural moves with feature work in one commit).
