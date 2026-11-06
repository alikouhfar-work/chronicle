# Architecture audit — Chronicle

Measured audit of the app as it stands on `demo` after Phase 3 (WP-19, WP-21 and the
component-layout pass). Written to be acted on in slices; it deliberately does **not**
propose a directory reshuffle.

## 0. Method, and the four skills that were asked for

The brief named four operating standards (`system:nextjs-enterprise-architecture`,
`system:typescript-strict-patterns`, `system:state-and-data-caching`,
`system:performance-and-bundle-optimization`). **None of them exist in this
environment** — this profile's skill library has no `system:*` namespace. Rather than
pretend to have loaded them, the audit was run against what actually exists and is
authoritative here:

- `chronicle` skill (module layout, contracts, gates) and its `references/module-refactor.md`.
- `src/architecture.test.ts` — the repo's real boundary spec (4 rules, CI-enforced).
- Measured evidence: import graph over all 573 source files, `tsc` runs with a stricter
  flag set, build artifacts, `.next` chunk sizes, route table.

Where the brief's assumptions don't match this codebase, that is called out instead of
being "fixed" into existence.

## 1. Verdict

The layout is already feature-sliced and disciplined: 14 modules, `services`/`queries`/
`actions`/`types`/`lib` separation, server-first pages, one write contract for rewatch,
63 test files including architecture guardrails. **A restructure would be churn, not
architecture.**

The real gaps are three, and none of them are about folders:

1. **Boundaries are nominal.** The module import graph is a single 18-node cycle, and
   `shared/` + `infra/` depend on features. Nothing enforces the layering, so it will
   drift further.
2. **Client weight is unmanaged.** 1.1 MB of client JS in three chunks, zero dynamic
   imports, five modal components eagerly in the graph.
3. **Configuration is informal.** No env schema (27 files read `process.env`), no runtime
   validation library, and the strict-flag set that would catch the rest is off
   (397 errors if enabled today).

Caching is a deliberate choice, not an oversight — but it is the *previous* Next 16 model,
and the repo's own note ("per-title tags would need one wrapper per title") is a symptom
of that. See F7.

## 2. Findings

Severity: P1 blocks scale, P2 pays interest every week, P3 cleanup.

### F1 · P1 — The module graph is one cycle; `shared` and `infra` depend on features

Measured over every `@/` import: the whole graph collapses to **one** strongly connected
component of 18 nodes (`modules/*`, `shared/*`, `infra/*`). Concretely:

- `shared/ui/HeaderActions.tsx` → `modules/notifications/components/NotificationBell`
- `shared/ui/trending/{TrendingMediaSection,TrendingMediaCard}.tsx` → `modules/show`, `modules/movie`, `modules/library/components/*`
- `shared/ui/upcoming/{UpcomingMediaSection,UpcomingMediaCard}.tsx` → `modules/movie/types`, `modules/episode-season/types`
- `shared/lib/computeWatchStats.ts` → `modules/movie`, `modules/show`, `modules/dashboard/types`
- `infra/auth/auth.ts` and `infra/auth/actions.ts` → `modules/user/actions/ensureUsername`

Fourteen import lines across six `shared` files, two in `infra`. The direction is
backwards: `shared` is supposed to be the bottom of the stack. This is why a
"shared" change can break a feature build, and why the cycle exists at all.

Fix: move feature-aware pieces down to where they belong — `trending/*` and
`upcoming/*` are discover/dashboard UI, not shared primitives; `computeWatchStats`
belongs to `dashboard/lib`; `ensureUsername` becomes `infra/auth`'s own step (it is
already called from auth callbacks, not from a feature). `HeaderActions` should take the
bell as a prop/slot from the layout.

### F2 · P1 — Nothing enforces layering

`src/architecture.test.ts` checks four things (types files are type-only; Prisma stays
out of `queries/`; TMDB stays out of `services/`; pages aren't Client Components). There
is no rule for module→module edges, `shared`→module edges, `infra`→module edges, or
barrel usage. Evidence that it matters: **184 cross-module deep imports** (e.g.
`modules/library` → `modules/show` 20 times, `modules/library` → `modules/movie` 10)
against **13** barrel imports, with the guardrail silent either way.

Fix: an explicit allow-list matrix in the same test file (no new dependency), and a
`dependency-cruiser` config only if you later want the graph picture in CI. Snippet in
§4.2.

### F3 · P1 — Client bundle: 1.1 MB, no code splitting

- `.next/static/chunks` totals **1.1 MB** uncompressed; the three largest chunks are
  **228 KB / 168 KB / 112 KB**.
- **Zero** `next/dynamic` or `React.lazy` in the tree.
- Client components per module: `library` 13 of 83 files, `comments` 6 of 49, `rewatch`
  5 of 24, `notes` 4 of 19.
- The heaviest client pieces are modals that only exist after a click:
  `RewatchHistoryModal` (423 lines), `WatchActionModal` (269), `NotificationBell` (301,
  with its popover), `LibraryDetailsShareButton`, plus `MediaCommentTabs` (177) which
  pulls the composer, report form and notes panel into every title page's graph.

Fix: `next/dynamic` for the four modals and the bell popover; keep the trigger button
eager. Snippet in §4.3. Expected effect: the title page's first-load graph loses the
watch dialogs and the report form entirely.

### F4 · P2 — Strictness gaps, measured

`strict: true` is on, `any` is genuinely absent (2 grep hits, both prose in comments).
Everything else that catches real defects is off. Running `tsc` with the battery enabled
gives **397 errors**:

| flag | errors | character |
|------|--------|-----------|
| `verbatimModuleSyntax` | 197 (TS1484) | mechanical — `import type` rewrites, auto-fixable |
| `noUncheckedIndexedAccess` | 88 (TS18048) + 47 (TS2532) | real: array/index reads that assume presence |
| `exactOptionalPropertyTypes` | 32 (TS2375) + 11 (TS2379) | real: `undefined` vs missing props |
| `noUnusedLocals`/`noUnusedParameters` | 3 (TS6133) | trivial |
| other (TS2322/TS2769) | 14 | case-by-case |

Also: `target: ES2017` (Next 16 runs on modern Node), `allowJs: true` with no JS in
`src/`, `skipLibCheck` (fine, keep).

### F5 · P2 — No env schema, no fail-fast

**27 files** read `process.env` directly; there is no `src/infra/config.ts` (the skill
claims one — stale). Examples: `infra/tmdb/client.ts:31` falls back silently on a missing
`TMDB_BASE_URL`, `infra/auth/auth.ts:13` derives `hasGoogle` from two separate reads, and
only S3 throws (at call time, in production). A typo in a secret surfaces as a runtime
500 in whichever path first touches it, not at boot.

### F6 · P2 — Runtime validation is hand-rolled and uneven

No `zod` (or equivalent) in `package.json`. Validation exists and is decent where it was
written — `comments/lib/validation.ts`, `rewatch/lib/writeContract.ts` (aliases, ids,
failure mapping) — but each boundary invents its own shape, and routes that parse bodies
(`/api/comments/upload`, `/api/moderation/reports`, `/api/users/search`) do it ad hoc.
Adding zod *everywhere* would be a rewrite; adding it at **four request boundaries** is
about a day and gives one error shape.

### F7 · P2 — Every route is dynamic; caching is the previous Next 16 model

All 26 route entries render `ƒ` (on-demand); only `_not-found`, `manifest`, `robots`,
`sitemap` are static. There is no `generateStaticParams`, no route-level `revalidate`, and
no `cacheComponents` in `next.config.ts` — caching happens only inside
`unstable_cache` fragments (`shared/lib/cacheTags.ts`: genres, trending, credits, similar).

That works, and the skill documents its cost: *"`unstable_cache` fixes its tags when the
wrapper is built, so per-title tags would need one wrapper per title."* Next 16 offers
the newer model — `cacheComponents: true` + `use cache` + `cacheLife`/`cacheTag`, where
the cache key includes the arguments, so per-title tags become possible without a wrapper
per title. That is a decision, not a bug: it changes revalidation semantics across the
app, so it gets its own package (WP-28) and a written decision either way.

Cheap wins that don't need that decision: `generateStaticParams` is impossible for
user-owned pages, but the public `/search/[mediaType]/[id]` page and `sitemap`/`robots`
can be route-cached.

### F8 · P3 — `modules/api` is not a feature

`modules/api` holds `lib/respond.ts` (HTTP helpers), `types/routeContext.ts`,
`services/auth.ts`. Two of those are infrastructure; keeping them under `modules/` is why
`app/api/*` routes import a "module" for plumbing, and why `shared/lib/httpErrorMap.ts`
(invented during WP-21) duplicates a corner of the same concern. Fix: `respond`,
`routeContext`, `httpErrorMap` → `infra/http/`; `services/auth.ts` → `infra/auth/`.

### F9 · P3 — Test placement is inconsistent for routes

`src/app/api/users/search/route.test.ts` sits next to its route; every other test lives in
the module it covers. Harmless, but it is the only one, so it reads as an accident.

### F10 · P3 — Barrel usage is undefined policy

13 barrel imports vs 184 deep imports. Either is fine; having both with no rule means
every new file guesses. Pick one: deep imports (current de facto norm) and document it, or
barrels per module with `import/no-internal-modules` to enforce it.

## 3. Target structure

Incremental — every move below closes a finding, nothing is moved for symmetry.

```
src/
  app/                      routes only: pages, layouts, loading, error, api handlers
    (main)/…                server components; no component definitions (rule already in SKILL.md)
    api/…                   thin handlers → module services or infra
  core/                     ← rename of nothing; see note
  infra/                    bottom of the stack: no imports from modules/ or shared/ui
    auth/                   NextAuth config, callbacks, ensureUsername (moved in)
    db/                     prisma, advisoryLock
    http/                   respond, routeContext, httpErrorMap, securityHeaders
    logging/ storage/ tmdb/
    env.ts                  ← new: parsed, frozen, fail-fast env
  shared/                   no imports from modules/ (enforced)
    ui/                     primitives + app chrome that take features as props/slots
    lib/ hooks/ types/
  modules/<feature>/        comments, library, show, movie, episode-season, media,
                            discovery, dashboard, notes, notifications, rewatch, user, auth
    actions/                'use server' writes
    components/             one component per file, 'use client' only on leaves
    constants.ts            runtime constants
    lib/                    pure logic
    mappers/                row → view
    queries/                external reads (TMDB)
    services/               Prisma reads
    types/                  type-only
```

The dependency law, stated once:

```
app → modules → shared → infra → (prisma, tmdb, storage)
```

with exactly two documented exceptions, both allowed by direction rather than by
convention: `modules/*/queries` may import `infra/tmdb`, and `modules/*/services` may
import `infra/db`. Anything pointing the other way (feature ← shared, feature ← infra,
module ↔ module) fails the guardrail.

Where the cycle gets cut:

| edge today | move |
|---|---|
| `shared/ui/trending/*` → movie, show, library | → `modules/discovery/components/` (it is the discover surface) |
| `shared/ui/upcoming/*` → movie, episode-season types | → `modules/dashboard/components/` (it is the dashboard rail) |
| `shared/lib/computeWatchStats` → movie, show, dashboard | → `modules/dashboard/lib/watchStats.ts` |
| `shared/ui/HeaderActions` → `NotificationBell` | bell passed as a slot from `(main)/layout.tsx` |
| `infra/auth/*` → `modules/user/actions/ensureUsername` | move the function into `infra/auth/ensureUsername.ts` (auth owns provisioning) |
| `modules/api/{lib,types}` | → `infra/http/` |
| `shared/lib/httpErrorMap` | → `infra/http/` |

## 4. Rules, with the code to enforce them

### 4.1 · `tsconfig.json` — staged strictness

Do it in this order so each commit is reviewable and the build stays green:

```jsonc
// 1) now — mechanical, 197 errors, all fixable by rewriting imports as `import type`
"verbatimModuleSyntax": true,
"target": "ES2022",
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"noImplicitOverride": true,
// remove "allowJs": true (no .js in src/; generated/prisma is .ts)

// 2) next — 135 real sites, mostly array destructuring and Record lookups
"noUncheckedIndexedAccess": true,

// 3) last — 43 sites, mostly component props passed as undefined
"exactOptionalPropertyTypes": true,
```

Keep `skipLibCheck: true` (dependency types are not yours to fix) and keep the `@/*`
alias — it is uniform already.

### 4.2 · Layering guardrail (no new dependency)

Add to `src/architecture.test.ts`, next to the existing four rules:

```ts
const LAYER = (repoPath: string): 'app' | 'modules' | 'shared' | 'infra' | 'other' => {
  if (repoPath.startsWith('src/app/')) return 'app';
  if (repoPath.startsWith('src/modules/')) return 'modules';
  if (repoPath.startsWith('src/shared/')) return 'shared';
  if (repoPath.startsWith('src/infra/')) return 'infra';
  return 'other';
};

const IMPORT = /from\s+['"](@\/[^'"]+)['"]/g;

const importsOf = (file: string): string[] =>
  [...readFileSync(file, 'utf8').matchAll(IMPORT)].map((m) => m[1].replace('@/', 'src/'));

// shared must not know features; infra must not know anything above it
const FORBIDDEN: Array<[string, RegExp]> = [
  ['src/shared/', /^src\/modules\//],
  ['src/infra/', /^(src\/modules\/|src\/shared\/ui)/],
];

it('keeps the dependency direction one-way', () => {
  const offenders = sourceFiles.flatMap((file) => {
    const repoPath = toRepoPath(file);
    return FORBIDDEN.filter(([prefix, forbidden]) => repoPath.startsWith(prefix))
      .flatMap(([, forbidden]) =>
        importsOf(file)
          .filter((spec) => forbidden.test(spec))
          .map((spec) => `${repoPath} -> ${spec}`),
      );
  });
  expect(offenders).toEqual([]);
});

it('has no module→module import cycles', () => {
  const graph = new Map<string, Set<string>>();
  for (const file of sourceFiles) {
    const from = toRepoPath(file).split('/').slice(0, 3).join('/');
    for (const spec of importsOf(file)) {
      const to = spec.split('/').slice(0, 3).join('/');
      if (from === to || !to.startsWith('src/modules/')) continue;
      if (!graph.has(from)) graph.set(from, new Set());
      graph.get(from)!.add(to);
    }
  }
  // one pass of DFS; a back-edge means a cycle
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (node: string): string | null => {
    state.set(node, 1);
    for (const next of graph.get(node) ?? []) {
      const seen = state.get(next) ?? 0;
      if (seen === 1) return `${node} -> ${next}`;
      if (seen === 0) {
        const found = visit(next);
        if (found) return found;
      }
    }
    state.set(node, 2);
    return null;
  };
  const cycles = [...graph.keys()].map(visit).filter(Boolean);
  expect(cycles).toEqual([]);
});
```

The cycle test is expected to fail until §3's moves land — land the `shared`/`infra`
moves first, then turn it on, otherwise the guardrail is red on day one and gets ignored.

### 4.3 · Client weight

```tsx
// modules/rewatch/components/RewatchButton.tsx (trigger stays eager)
const WatchActionModal = dynamic(
  () => import('./WatchActionModal').then((m) => m.WatchActionModal),
  { ssr: false },
);
// same for RewatchHistoryModal, the notification popover, and CommentReportForm
```

Rule: a Client Component that only mounts after a user interaction is a `dynamic()`
import. Add a guardrail in the same test file — fail when a client file over ~200 lines
imports three or more sibling client components, or simply review chunk sizes per release
(`.next/static/chunks` top-3 sum) and keep it under a stated budget (e.g. 400 KB).

### 4.4 · Env

```ts
// src/infra/env.ts — imported once by infra, never by components
import 'server-only';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
};

const optional = (name: string, fallback: string): string => process.env[name] ?? fallback;

export const env = Object.freeze({
  appUrl: optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  tmdb: { baseUrl: optional('TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
          token: required('TMDB_ACCESS_TOKEN') },
  // …one field per variable; no process.env reads anywhere else
});
```

Then replace the 27 ad-hoc reads. `NEXT_PUBLIC_*` values stay where Next can inline them
(build-time, client), so they get a separate, explicitly public export.

### 4.5 · Validation at boundaries

If you adopt zod, confine it to request parsing and keep `writeContract` as the shape:

```ts
const RewatchBody = z.object({
  rewatched_at: z.string().datetime().optional(),
  client_request_id: z.string().uuid().optional(),
}).strict();

const parsed = RewatchBody.safeParse(raw);
if (!parsed.success) return respond(400, { message: 'Invalid body', issues: parsed.error.issues });
```

If you don't, make the existing hand-rolled parsers share one signature
(`(input: unknown) => { ok: true; value } | { ok: false; message }`) so every route maps
failure the same way. Either is defensible; having both is not.

### 4.6 · Caching decision (WP-28)

Write the decision in `docs/remediation-plan.md` before touching code:

- **Stay** on `unstable_cache` (current): zero risk, coarse tags, one wrapper per tag.
- **Move** to `cacheComponents: true` + `use cache`/`cacheLife`/`cacheTag`: per-title
  cache keys become possible, but every cached read and its invalidation must be
  re-proven, and the previous model's docs stop applying.

Until then, the cheap ones: `export const revalidate = 3600` on `/search/[mediaType]/[id]`
where the data is TMDB-only, and confirm `sitemap`/`robots` are static.

## 5. Sequencing

| WP | Package | Closes | Effort | Risk |
|----|---------|--------|--------|------|
| WP-25 | Layering moves (§3 table) + guardrail (§4.2) | F1, F2 | M | low — moves + import rewrites, tests follow |
| WP-26 | Client weight: `dynamic()` for 5 surfaces + chunk budget | F3 | S | low |
| WP-27 | `verbatimModuleSyntax` + unused/override flags (§4.1 step 1) | F4 | S | low — mechanical |
| WP-28 | Caching decision + route-level revalidate | F7 | S (decision) / M (migration) | medium if migrating |
| WP-29 | `infra/env.ts` + migrate 27 reads; `infra/http` absorbs `modules/api` | F5, F8 | M | low |
| WP-30 | Validation contract at 4 request boundaries (zod or shared parser) | F6 | M | low |
| WP-31 | `noUncheckedIndexedAccess`, then `exactOptionalPropertyTypes` | F4 | M | medium — touches data mapping |
| WP-32 | Test placement + barrel policy (document + enforce) | F9, F10 | S | none |

## 6. Explicit non-goals

- **No directory reshuffle.** The feature-sliced layout is right; nothing in this audit
  moves a module.
- **No TanStack Query.** Every read is a Server Component read or a Server Action; there
  is no client cache to manage, and adding a query client would duplicate the RSC cache
  and grow the bundle. The one polling surface (the bell) is intentional.
- **No global state library.** `useState` + Server Actions is the correct size here; the
  only cross-component state is toast + session, both already solved.
- **No zod-everywhere rewrite.** Four boundaries, one error shape.
- **No automatic moderation, no i18n, no design-system rewrite** — out of scope for a
  single-owner tracker and not implicated by any finding.

## 7. Resolution status (2026-11-05, Phase 5)

| Finding | Status | What landed |
|---|---|---|
| F1 shared/infra → feature edges | **fixed** | 14 edges cut; `shared/` and `infra/` import no feature (WP-25) |
| F2 no boundary enforcement | **fixed** | `architecture.test.ts`: layering rules, 31-pair feature ratchet, barrel rules, env rules (WP-25/29/32) |
| F3 client weight | **mitigated** | six interaction-only surfaces are `dynamic()`; bell stays eager (WP-26). No byte budget asserted yet |
| F4 strictness gaps | **partly** | `verbatimModuleSyntax`, `noUnused*`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `ES2022`, `noUncheckedIndexedAccess` on (WP-27/31). `exactOptionalPropertyTypes` still off — 45 measured errors, two classes (≈25 prop types that receive `undefined`, 6 Prisma/`RequestInit` object literals that need conditional spreads); it is WP-31b, not a late-night flip |
| F5 env access | **fixed** | `infra/env.ts` + `shared/lib/publicEnv.ts`; `process.env` outside them fails the test (WP-29) |
| F6 validation | **fixed** | `shared/lib/parse.ts` + the two boundary parsers (WP-30) |
| F7 caching | **decided** | D5: stay on `unstable_cache`; route-level caching is blocked by the session-reading `(main)` layout (WP-28) |
| F8 `modules/api` | **fixed** | absorbed into `infra/http` + `infra/auth` (WP-25) |
| F9 test placement | **decided** | tests live beside the code they cover; route handlers are covered by a test beside the route. Documented, nothing moved (WP-32) |
| F10 barrel policy | **fixed** | barrels are a module's own public surface only, imported by path (`@/modules/x`), never `@/modules/x/index`; feature→feature imports stay deep paths. Enforced (WP-32) |

Still open on purpose: `exactOptionalPropertyTypes` (WP-31b), a client-byte budget for
F3, and the three two-way feature pairs named in `src/architecture.test.ts`
(library↔discovery, comments↔notes, show↔episode-season).
