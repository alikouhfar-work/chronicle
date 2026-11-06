# Moderation — what exists, what is missing, what to decide

Companion to `docs/gap-analysis.md` (C2) and `docs/remediation-plan.md` (WP-19).
Written after WP-19 shipped so the open product decisions have one place to live.
Code references are to the state of the branch at the time of writing.

## 1. What a report does today

1. A signed-in reader opens any public review that is not their own and presses
   the flag (`comments/components/CommentReportButton`), picks a reason
   (spam / abuse / off_topic / other) and may add a note of up to 500 characters.
2. `comments/actions/reportComment` writes one `comment_reports` row:
   `comment_id`, `reporter_id`, `reason` (lowercase enum label), `note`,
   `created_at`, `resolved_at = null`. It refuses your own review and an unknown
   reason, and treats a second report by the same reader as success with
   `alreadyReported` (unique `(comment_id, reporter_id)`).
3. Nothing else happens. No notification, no counter in the UI, no mail.
4. The only reader of the queue is `GET /api/moderation/reports` with
   `Authorization: Bearer <CRON_SECRET>`; it returns at most 50 open reports,
   grouped per review (`comments/services/moderateComments.listModerationQueue`).
5. The operator decides with `POST /api/moderation/reports`:
   - `{ commentId, action: "hide", reason? }` — sets `comments.hidden_at` and
     `hidden_reason`, resolves every open report on that review, revalidates the
     media page. The review leaves every public feed; its author keeps seeing it
     with “Hidden from public view — <reason>”.
   - `{ commentId, action: "dismiss" }` — stamps `resolved_at` on the open reports
     and leaves the review up.
6. `listComments` filters `hiddenAt: null` for everyone except the author, so a
   hidden review is invisible to other readers immediately.

**Who handles it today:** whoever holds `CRON_SECRET` — in practice the single
repo owner, with `curl`. There is no moderator role, no admin page and no queue
UI. **Who decides it is "reported":** that same person, by judgement, with no
criteria recorded anywhere.

## 2. Findings

| # | Finding | Severity | Evidence |
|---|---------|----------|----------|
| M1 | A decision records no actor — `resolved_at` only, so the queue cannot answer "who hid this" | P1 | `prisma/schema.prisma` (`comment_reports`), `moderateComments.ts:117-130` |
| M2 | Hiding is one-way; an accidental hide is only reversible in SQL | P1 | `moderateComments.ts:99-140` (`hide`/`dismiss` only) |
| M3 | After a dismissal the same reader can never report that review again, even if it is edited into something worse | P2 | unique `(comment_id, reporter_id)`; `reportComment` maps P2002 to `alreadyReported` |
| M4 | The author learns nothing at the time; the notice appears only on their next visit | P2 | no write to `notifications` in `reportComment`/`moderateComments` |
| M5 | One report is indistinguishable from five, and one reader with several accounts counts as several — no threshold, no reputation, no rate limit | P2 | `listModerationQueue` groups reports but nothing weights them |
| M6 | The queue silently truncates at 50 open reports | P3 | `QUEUE_LIMIT` in `moderateComments.ts` |
| M7 | A dismissed report leaves no reason trail (`hidden_reason` is only written on hide) | P3 | `comment_reports` has no `decision_reason` |

Note on M4: `Notification` requires an `actorId` (a real user) and is unique per
`(recipient, comment)`. A "your review was hidden" notification therefore needs a
system actor or a nullable `actorId`, and it collides with any mention
notification already sitting on that same comment. This is a schema decision, not
a one-line change.

## 3. Open questions (answer inline under each)

1. Who reviews reports: keep the `CRON_SECRET` operator surface, add a
   moderator flag on `User` (`role`/`isModerator`) with a session-gated
   `/moderation` page, or both (token for automation, flag for the human)?
Answer:

2. What makes a review actionable: any single report, only `abuse` (with
   evidence in the content), a threshold of distinct reporters, or always a
   human judgement with no automatic action?
Answer:

3. Must hiding be reversible: is `unhide` required, and who may call it (same
   operator, or the author appealing)?
Answer:

4. Should the author be told at the time of hiding (bell notification with the
   reason) or is the notice on their own review enough?
Answer:

5. After a dismissal, may the same reader report the review again — never, or
   once it has been edited since (`comment.updatedAt > report.created_at`)?
Answer:

6. Retention: how long do resolved reports and their notes stay (they are
   moderation history, but also personal data about the reporter)?
Answer:

## 4. Candidate work packages

Ordered so the irreversible parts come first. None of this is started.

### WP-24a · Record the decision (M1, M7)
- Migration: `comment_reports.resolved_by` (text: operator id or `token`),
  `decision` (`hidden` | `dismissed`), `decision_reason` (nullable text).
- `applyModerationDecision` writes all three; the queue exposes the last decision
  per review so a repeat report is not re-decided blindly.
- No product decision needed; safe to build before the answers above.

### WP-24b · Unhide (M2)
- `applyModerationDecision({ action: 'unhide' })` clears `hidden_at` and
  `hidden_reason`, revalidates the media, and records the decision (WP-24a shape).
- Tests: hide → unhide restores the feed for other readers; the author's notice
  disappears; the decision trail keeps both rows.
- Depends on Q3.

### WP-24c · Re-report after dismissal (M3)
- `reportComment` becomes an upsert on `(comment_id, reporter_id)`: if the
  existing row is resolved **and** `comment.updatedAt > row.created_at`, reopen
  it (new reason/note, `resolved_at = null`, `created_at = now`); otherwise keep
  the "already reported" no-op. No schema change, no partial index (a partial
  unique index would drift from Prisma and fail the CI `migrate diff` gate).
- Depends on Q5.

### WP-24d · A moderator who is not a shell command (Q1)
- Option A: `User.role` enum (`USER`/`MODERATOR`) + `/moderation` server page
  listing `listModerationQueue` with hide/dismiss buttons.
- Option B: keep the token route and add no UI.
- Either way the route stays for automation; the page (if built) calls the same
  service, never the route.

### WP-24e · Tell the author (M4)
- Needs the `Notification` decision above: system actor row vs nullable
  `actorId`, plus a `COMMENT_HIDDEN` type and a deep link that explains the
  reason (`hiddenReason` already exists).
- Depends on Q4.

### WP-24f · Queue hygiene (M5, M6)
- Distinct-reporter count per review in the queue payload, paging or an explicit
  "more than 50" flag, and a per-reporter rate limit (e.g. 10 reports/day) so one
  account cannot fill the queue.
- Depends on Q2 for whether a threshold also drives automatic action.

## 5. Explicitly out of scope

- Automated content classification. There is no ML moderation here and none
  planned; reports are human input.
- Blocking a user. `CommentReport` is per review; a per-user block would be a
  separate model and a feed filter.
- Reporter identity shown to the author. Nothing in the current schema exposes
  reporters through the app; the token route is the only reader, and should stay
  that way.
