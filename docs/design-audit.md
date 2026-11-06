# Design system audit — Chronicle

Measured 2026-11-06 against `demo` @ `24b4881`. Every number below was produced by a
script over `src/**/*.tsx` (156 files) plus computed WCAG contrast ratios; nothing is
an impression. Tokens live in `src/app/globals.css`; the rules are enforced by
`src/design.test.ts`.

> The brief asked for three `system:*` skills (design-system-foundations,
> ui-ux-consistency-audit, accessible-component-patterns). They do not exist in this
> environment — the audit was run against the project's own `chronicle` skill,
> `ui-design` (42 accessibility/UX rules) and measured evidence instead of pretending
> to load them.

---

## 1. What the app actually looked like

The design system was **declared but not adopted**. `@theme` published five tokens
(`--color-canvas`, `--color-surface-elevated`, `--color-surface-highlight`,
`--color-primary`, `--color-secondary`) and the components ignored four of them:

| Token | Uses |
|---|---|
| `bg-canvas` | 4 |
| `bg-surface-elevated` | 0 |
| `bg-primary` / `text-primary` | 0 |
| `bg-secondary` | 0 |

Meanwhile the raw Tailwind palette carried the UI: **410 `zinc-*` utilities, 394
`violet-*`, 579 `white` (mostly `/6`–`/10` alphas), 46 `rose` + 35 `red` for one
danger state, 44 `amber`, 28 `indigo`**. A token nobody uses is a comment, not a
system.

### D1 — No type scale (critical, 97 sites)

`text-[9px]` ×8, `text-[10px]` ×34, `text-[11px]` ×54, `text-[13px]` ×1 — four
near-identical micro sizes across 40 files, sitting next to `text-xs` (12px) ×176.
Nine-pixel labels are also a WCAG problem: at 9px on a dark substrate the glyph
stroke disappears before contrast even matters.

### D2 — One status, three colours (high)

Danger was `rose` (46 uses) **and** `red` (35); warning `amber` (44); success
`emerald` (20); info split between `indigo` (28) and `sky`. Two different chips in
the same list could mean the same thing in different colours.

### D3 — Contrast failures in shipped UI (high)

Measured against the canvas `#0c0d12`:

| Pair | Ratio | Verdict |
|---|---|---|
| `text-zinc-600` (`#52525b`) — 13 uses | 2.51 | **fails** AA (needs 4.5) |
| `text-zinc-500` (`#71717a`) — 19 uses | 4.02 | **fails** for body text |
| `text-white/40` | 3.81 | **fails** |
| white on `#8b5cf6` (the primary button) | 4.23 | **fails** for 14px semibold |
| input border `white/10` vs canvas | ~1.1 | **fails** 1.4.11 (needs 3:1) |
| `text-zinc-400` (`#a1a1aa`) | 7.57 | passes |
| accent text `#a78bfa` | 7.13 | passes |

So: placeholder text, timestamps, the primary call-to-action and every form field
boundary were below AA — the four most frequently rendered surfaces in the app.

### D4 — Radius drift (medium, 200 + 138 sites)

`rounded-full` 200, bare `rounded` 138, `-md` 52, `-xl` 45, `-lg` 19, plus
`-2xl`/`-3xl`. Two sibling surfaces disagreed by 12px: `EmptyState` was `rounded-2xl`
and `ErrorState` `rounded-3xl`.

### D5 — Elevation drift (medium)

`shadow-2xl` ×29, `shadow-md` ×22, `shadow-lg` ×17, `shadow-xl` ×9 on a system whose
glass cards already carry a shadow from `.glass-card` — double elevation, and no two
cards agreeing on the drop.

### D6 — Keyboard focus removed without replacement (high, a11y)

15 inputs/controls used `focus:outline-none`. Twelve paired it with a ring; five
removed the global `:focus-visible` outline and put nothing back (report form,
mention list rows, signup confirm field, library sort select). Also 24 `focus:ring-2`
were pointer-triggered (`focus:`), so the ring fired on click and the keyboard path
was inconsistent.

### D7 — Alpha soup (medium)

`border-white/10` 137, `/8` 98, `bg-white/6`/`/4`/`/3`, `bg-white/12`/`/15`/`/20`.
Nine alpha steps for three jobs (hairline, soft fill, hover fill) — every new
component re-invented the value.

### D8 — Skeletons bypass the primitive (low, consistency)

`shared/ui/Skeleton` exists, but six loading routes hand-roll
`animate-pulse rounded-* bg-zinc-700` (27 occurrences). Two loading languages.

### D9 — One primitive is a pass-through (low)

`ActionButton` adds `aria-busy` and a spinner, nothing else — no disabled opacity, no
focus treatment, so each of its ~40 call sites re-derives button states.

---

## 2. The token system

Two layers, one file: **primitives** (what a value *is*) and **semantics** (what it
*means*). Components may only use semantics. A rebrand edits this block, nothing else.

### 2.1 Substrates and lines

| Semantic token | Value | Use |
|---|---|---|
| `canvas` | `#0c0d12` | page substrate |
| `surface` | `#14151f` | cards, panels |
| `surface-raised` | `#1b1c2b` | popovers, menus, chips |
| `surface-sunken` | `#090a0e` | wells: composers, inputs on a panel |
| `surface-strong` | `#2a2a33` | media placeholders, progress tracks |
| `surface-soft` | `rgb(255 255 255 / .06)` | translucent fill on any substrate |
| `surface-soft-hover` | `rgb(255 255 255 / .12)` | the same, hovered |
| `line` | `rgb(255 255 255 / .10)` | decorative separation |
| `line-strong` | `rgb(255 255 255 / .18)` | hover / emphasis |
| `line-control` | `#6b6b74` (3.68:1) | **the only border a form control may use** |

### 2.2 Ink

| Token | Value | Ratio on canvas | Allowed for |
|---|---|---|---|
| `ink` | `#f4f4f5` | 17.7 | headings, primary body |
| `ink-secondary` | `#d4d4d8` | 13.1 | body on panels |
| `ink-muted` | `#a1a1aa` | 7.6 | secondary copy, metadata |
| `ink-subtle` | `#8f8f99` | 6.1 | timestamps, captions, placeholders |
| `ink-disabled` | `#6b6b74` | 3.7 | disabled only, never body text |

The old `zinc-500`/`zinc-600` text now maps to `ink-subtle` — the smallest change
that clears AA without making secondary copy look primary.

### 2.3 Accent

| Token | Value | Ratio | Use |
|---|---|---|---|
| `accent` | `#7c3aed` | white on it = **5.7** | filled controls carrying white text |
| `accent-bright` | `#8b5cf6` | — | hover state, decorative gradient stops |
| `accent-strong` | `#a78bfa` | 7.1 | indicator fills: dots, bars, icons |
| `accent-ink` | `#a78bfa` | 7.1 | accent text on dark |
| `accent-tint` | `#ddd6fe` | — | text on an `accent-soft` fill |
| `accent-soft` | `rgb(139 92 246 / .14)` | — | tinted chip background |
| `accent-line` | `rgb(139 92 246 / .35)` | — | chip border |
| `on-accent` | `#ffffff` | 5.7 | label on `accent` |

The primary button moved from `#8b5cf6` (4.23:1) to `#7c3aed` (5.7:1) — that is the
one deliberate colour change in the whole migration.

### 2.4 Status

| Token | Value | Ratio | Soft | Meaning |
|---|---|---|---|---|
| `success` | `#34d399` | 10.1 | `success-soft` 12% | done, added, live |
| `warning` | `#fcd34d` | 13.5 | `warning-soft` 12% | caution, quota, pending |
| `danger` | `#fb7185` | 7.2 | `danger-soft` 12% | destructive, failed |
| `info` | `#818cf8` | 6.5 | `info-soft` 12% | neutral information |
| `rating` | `#fbbf24` | 11.6 | — | stars only |
| `focus` | `#a78bfa` | 7.1 | — | the `:focus-visible` outline |

**Never colour alone** (`color-not-only-indicator`): every status chip pairs the
colour with an icon or a word. `rose` and `red` both map here — one danger, one hue.

### 2.5 Type, radius, elevation, motion

| Kind | Tokens |
|---|---|
| Type | `text-micro` 11px/1.15, `text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24, `text-3xl` 30, `text-4xl` 36, `text-5xl` 48 |
| Radius | `rounded-xs` 8, `rounded-control` 12, `rounded-card` 16, `rounded-pill` 9999, `rounded-none` |
| Elevation | `shadow-card`, `shadow-panel`, `shadow-popover` (all from `globals.css`) |
| Motion | `--ease-out-expo`, `--duration-fast` 150ms, `--duration-base` 250ms, global `prefers-reduced-motion` block |

`text-micro` is the only size below 12px, and it carries `letter-spacing: .02em`
because 11px uppercase without tracking reads as noise.

---

## 3. Component API rules

1. **Components consume semantics, never primitives.** `bg-surface`, not
   `bg-zinc-900`; `text-ink-muted`, not `text-zinc-400`. The one exception is poster
   artwork, where a title-derived gradient is an image placeholder
   (`shared/lib/getGradientForTitle.ts`, `infra/tmdb/images.ts`).
2. **One status recipe.** Chip = `border-{status}/30 bg-{status}-soft text-{status}`;
   never a one-off alpha. Status colour is always accompanied by an icon or a word.
3. **Controls get `border-line-control`.** Decorative panels get `border-line`.
   A control whose boundary is a hairline fails 1.4.11.
4. **Focus is never removed, only replaced.** `focus:outline-none` requires
   `focus-visible:ring-2` on the same element or a `focus-within:ring` on its
   wrapper. Pointer-triggered rings use `focus-visible:`, not `focus:`.
5. **Radii come from the scale.** Controls 12px, cards 16px, pills 9999px, inner
   tiles 8px. A new radius is a token change, not a utility.
6. **Elevation comes from the scale.** A card either uses `.glass-card` (which
   carries `shadow-card`) or `shadow-card`; never both, never `shadow-2xl`.
7. **Empty, failure and loading surfaces use their primitives** (`EmptyState`,
   `ErrorState`, `Skeleton`) — a bespoke pulse div is D8 again.
8. **Button states come from the primitive.** `ActionButton` owns busy/disabled
   opacity; call sites pass intent, not `opacity-60`.
9. **No raw hex in a component.** The tokens own every value; `app/layout.tsx` and
   `app/manifest.ts` are the only exceptions (PWA manifest values).

---

## 4. What changed in this pass

| Axis | Before | After |
|---|---|---|
| Arbitrary type sizes | 97 | **0** |
| Raw palette utilities | ~1,400 | **~10 (poster scrims only)** |
| Radius steps in use | 6 | **4** (`xs`, `control`, `card`, `pill`) |
| `text-white` / `text-zinc-*` | 579 / 410 | `text-ink*` everywhere |
| Focus rings removed with nothing put back | 5 | **0** |
| Form-control borders below 3:1 | all | **`line-control`, 3.68:1** |
| Contrast-failing text colours in use | `zinc-500`, `zinc-600`, `white/40` | none (lowest text ratio now 6.1) |
| Guardrails | none | **5 rules** in `src/design.test.ts` |

Migration was scripted and then hand-checked where semantics mattered: 156 component
files touched for palette/type/radius, 6 primitives rewritten to tokens, the design
tokens themselves expanded from 5 to 45.

Verified: `tsc`, eslint, 374 unit tests (5 new), production build, 9/9 Playwright
journeys, and a live browser pass on `/login` confirming computed values —
input border `rgb(107,107,116)`, submit `rgb(124,58,237)` with `rgb(244,244,245)`
label, `text-micro` actually rendering at 11px, zero horizontal overflow.

---

## 5. Debt that remains (deliberate)

- **`bg-gradient-to-*`/`bg-linear-to-*` scrims** over posters still use
  `from-zinc-800`/`via-zinc-900`: they are image placeholders, allowed by the
  guardrail and listed in it.
- **Six loading routes hand-roll skeletons** (D8). Converting them to `<Skeleton>` is
  mechanical but touches layout geometry; it needs a visual pass, not a script.
- **`ActionButton` is still a pass-through** (D9) — its 40 call sites each restate
  disabled/hover. Fixing it means auditing every button's intent.
- **No dark/light switch**: `color-scheme: dark` only. `color-dark-mode` is satisfied
  by the app being dark-first; a light theme would need a second token block and a
  `@media (prefers-color-scheme: light)` override of every substrate.
- **No motion tokens adopted in components** (`--ease-out-expo` exists, but 110
  `transition-*` utilities still use their defaults).

## 6. Questions (answer inline under each)

1. Is the slightly deeper primary violet (`#7c3aed` instead of `#8b5cf6`) acceptable
   as the permanent brand fill? It is what buys AA on every primary button.
   Answer:

2. Should the six hand-rolled skeletons become `<Skeleton>` in one pass, or stay as
   they are until each page is next edited?
   Answer:

3. Do you want a light theme, or is dark-only a locked product decision?
   Answer:

4. Should `text-micro` stay at 11px, or is 10px acceptable for dense chips if the
   label is short (and therefore exempt from the 12px body rule)?
   Answer:

5. Poster placeholder gradients: keep the neutral zinc ramp (current), or move them
   onto the accent ramp so every fallback reads as brand?
   Answer:
