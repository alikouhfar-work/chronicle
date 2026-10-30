# Public Reviews & Comments — Implementation Plan

Phased, agent-ready prompts for adding public reviews, image attachments, @mentions, and mention notifications to Chronicle.

---

## Corrections to the original plan

Verified against this repo before writing the prompts:

- **No comments module or `Comment` model exists.** "Personal Notes" in this plan means the existing `rating` / `notes` fields on `MovieTracking` and `EpisodeTracking`. `ShowTracking` has no notes field.
- **`User` has no handle/username** — only `name`, `email`, `image`. Phase 3 (mentions) requires a `username` column plus a backfill before `@mentions` can resolve.
- **`RewatchLog` already defines the polymorphic media pattern** (`mediaType` + `mediaId` + nullable FKs). New tables follow it rather than inventing a second convention.
- **No object storage is configured.** Attachment storage target (S3/R2/local dev) must be chosen and documented in Prompt 4.

---

## Shared guardrails (prepend to every prompt)

```markdown
## Rules
- Stack: Next.js App Router, Prisma + Postgres, NextAuth, Tailwind. Follow existing module layout under src/modules/<domain>/{components,actions,services,types}.
- All mutations are server actions; validate input server-side. Never trust IDs or mention handles from the client.
- Reuse existing patterns: native <dialog> + showModal() for modals, useTransition for pending states, toast for errors.
- Do not modify or delete existing tracking/rewatch behavior.
- Every phase must end with: npx tsc --noEmit, npm run lint, npm test, npm run build all passing.
- Stop and report if a required assumption is false; do not silently invent data.
```

---

## Prompt 1 — Schema & migration

```markdown
# TASK: Add public reviews, attachments, mentions, and notifications schema

## Scope
Extend prisma/schema.prisma only (plus the migration). No UI.

## Models
- PublicComment: id (uuid), userId, mediaType enum (MOVIE|SHOW|EPISODE), mediaId,
  content @db.Text, createdAt, updatedAt, deletedAt (soft delete).
  Indexes: [mediaType, mediaId, createdAt], [userId, createdAt].
- CommentAttachment: id, commentId, url, width?, height?, mimeType, sizeBytes,
  createdAt. Cascade on comment delete.
- CommentMention: id, commentId, mentionedUserId, createdAt.
  Unique [commentId, mentionedUserId]; cascade on delete.
- Notification: id, recipientId, actorId, type enum (COMMENT_MENTION),
  commentId, isRead default false, createdAt.
  Indexes: [recipientId, isRead, createdAt]; cascade on comment delete.
- User: add `username String? @unique` (lowercase, 3-32 chars, [a-z0-9_]) and
  relations for comments, mentions, notifications sent/received.

## Conventions
- Follow RewatchLog: @@map snake_case table names, @map("snake_case") columns,
  explicit @@index entries, onDelete: Cascade.

## Acceptance
- `npx prisma migrate dev --name public_reviews` succeeds and generates a clean client.
- No existing model/column is renamed or dropped.
- Report the exact diff of schema.prisma.
```

---

## Prompt 2 — Username backfill & profile handle

```markdown
# TASK: Backfill usernames so @mentions are addressable

## Scope
Migration/script + minimal UI. Depends on Prompt 1.

## Work
- Backfill strategy for existing users: derive from email local-part, lowercase,
  strip invalid chars; resolve collisions with a numeric suffix.
- If derivation fails, assign `user_<id-prefix>`.
- Add a username field to the profile/settings surface with uniqueness validation
  and a server action. Keep `name` as the display name.
- Public comment payloads expose `username`, `name`, `image` only — never email.

## Acceptance
- Every existing user has a non-null unique username after migration.
- Attempting to take an existing handle returns a field error, not a 500.
- Test: backfill is idempotent (running twice changes nothing).
```

---

## Prompt 3 — Comment service layer & read path

```markdown
# TASK: Comment service + server actions

## Files
src/modules/public-comments/{services,actions,types}

## Work
- createComment({ mediaType, mediaId, content, attachmentIds }) — auth required,
  content trimmed, 1..2000 chars, max 4 attachments, reject attachments already
  claimed by another comment.
- updateComment / deleteComment — author only; delete is a soft delete and must
  not orphan notifications (cascade or explicit cleanup — state which you chose).
- listComments({ mediaType, mediaId, cursor, limit=20 }) — newest first,
  keyset pagination, includes author + attachments.
- getCommentById — used by notification deep links; returns null if soft-deleted.

## Acceptance
- Unauthenticated create/update/delete rejected.
- Non-author update/delete rejected with a typed error.
- Pagination returns a stable cursor and no duplicates when new comments arrive.
- Integration tests cover: create, list pagination, author-only rules, soft delete.
```

---

## Prompt 4 — Image attachments & storage

```markdown
# TASK: Image upload for public comments

## Work
- Choose one storage target and document it (S3/R2 presigned PUT or local dev dir).
  Do not commit credentials; read from env and fail loudly if missing.
- Upload flow: client requests presigned URL -> PUT -> POST attachment record ->
  attach to comment. Orphaned uploads are the client's problem; do not attach
  unclaimed attachments on submit.
- Validate on the server: mimeType in {jpeg,png,webp}, max 5 MB, max 4 per comment.
- Render an image grid in the feed with fixed aspect-ratio tiles and a lightbox
  (reuse existing dialog pattern).

## Acceptance
- Oversized or wrong-type uploads rejected before storage write.
- Attachments render after reload and survive comment edit.
- No signed URL or bucket secret is exposed in client props.
```

---

## Prompt 5 — Tabbed Notes / Public Reviews UI

```markdown
# TASK: Tabbed comment surface on movie, show, and episode pages

## Constraint
There is no personal comment model. The "Personal Notes" tab renders the existing
`rating` and `notes` fields (MovieTracking / EpisodeTracking). For shows, render
the show-level tracking summary with an explicit empty state — do NOT invent a
show notes table in this task.

## Work
- Add a shared <MediaCommentTabs> component: tabs "Personal Notes" | "Public Reviews",
  URL-synced (`?tab=reviews`) so links are shareable, keyboard accessible
  (role=tablist, arrow keys), and respects prefers-reduced-motion.
- Public Reviews tab: composer (textarea, attachment trigger, submit), feed with
  author avatar/name/@handle, relative timestamp, content, attachment grid,
  "Load more" via cursor.
- Optimistic insert on submit, rolled back with a toast on failure.
- Empty, loading (skeleton), error, and signed-out states for each tab.
- Comment nodes carry `id="comment-<id>"` for deep-link highlighting.

## Acceptance
- Tab state survives reload and back/forward navigation.
- Composer disabled with a clear CTA when signed out.
- No layout shift when switching tabs.
- Screens captured for movie, show, episode on mobile and desktop widths.
```

---

## Prompt 6 — @mention parsing

```markdown
# TASK: Mention autocomplete + server-side mention extraction

## Work
- GET /api/users/search?q= — auth required, min 2 chars, max 8 results,
  case-insensitive prefix match on username, rate limited per user.
- Composer: typing `@` opens an anchored autocomplete list; selecting a user
  inserts `@username` and records the user ID in a hidden mention set.
- Server: extract mentions from the final content with a strict regex
  (/(?<![\w@])@([a-z0-9_]{3,32})/gi), resolve via one batched user lookup,
  and persist CommentMention rows. Ignore unknown handles.
- Never trust the client mention set: server extraction is authoritative, and
  the stored content is sanitized/escaped on render (no raw HTML).
- Self-mentions are recorded but must not create a notification.

## Acceptance
- Handles inside code blocks or emails are not treated as mentions (test each).
- Unknown handles are left as plain text and create no rows.
- 10 mentions in one comment produce exactly 10 rows, no N+1 (assert query count).
- Mention rules covered by unit tests.
```

---

## Prompt 7 — Notifications (creation, bell, popover)

```markdown
# TASK: Mention notifications and header bell

## Work
- On comment create, insert one Notification per mentioned user (excluding the
  author), in the same transaction as the comment. Dedupe per (recipient, comment).
- Header bell: unread count badge (cap display at "9+"), polled or revalidated on
  navigation — no websockets in this phase.
- Popover: latest 8 notifications, actor avatar, text
  "<Actor> mentioned you in a comment on <Media title>". Requires denormalizing a
  media title snapshot at creation time so deleted media still renders.
- Click: mark read (optimistic), navigate to the media/episode route with
  `#comment-<id>`, scroll into view, and pulse-highlight via a CSS animation that
  respects prefers-reduced-motion.
- Add "Mark all as read" and an empty state.

## Acceptance
- Unread count updates without a full page reload after visiting a notification.
- Clicking a notification whose comment was deleted lands on the media page with
  a non-blocking "comment unavailable" notice.
- Notifications are scoped per user; no cross-account leakage in tests.
- Badge is keyboard reachable and announced (aria-live polite).
```

---

## Dispatch order

1 → 2 → 3 → 4 → 5 → 6 → 7

Prompts 4 and 6 are parallelizable once Prompt 3 lands. Prompt 5 needs 3 (and 4 for the attachment UI). Prompt 7 needs 1 and 6.
