# FandomVerse — project state

**Purpose:** everything a new session needs before touching this repo. Read
this first; it replaces re-deriving context from the other docs.

**Last updated:** 2026-09-25 · branch `master` · HEAD `a69c50f` ·
**nothing committed** (all work is in the working tree).

---

## 1. Standing rules

- **Never commit, never push, never reset.** Every phase ends with a report
  and a stop.
- Do not change: data (7 categories, 35 characters), master assets, schema,
  existing routes, the Kage engine, `ATTRIBUTION.txt`.
- No new dependency, no CDN, no remote font.
- Never weaken, skip or delete a test to make it pass. Classify failures:
  **A** real regression · **B** stale test contract · **C** temporary audit ·
  **D** infrastructure/flake. Never call everything a flake.
- Do not report PASS/READY without real visual QA.

## 2. Architecture

React 19.2 + TypeScript strict + Vite 8, `createHashRouter`, CSS Modules,
dark-only. Canonical tokens in `src/styles/tokens.css`.

**D-032 HashRouter trap:** never write a raw `#fragment` href and never read
`window.location.search`. Use router APIs or a `<button>`.

### The two chrome surfaces

| Surface | Header/Footer | Kage visual |
|---|---|---|
| `/` (cinematic landing) | the **Kage document's own** bar + colophon. `RootLayout` stands the React shell down here. | Chapter 00 **yes**; Chapters 01–07 **no** |
| 7 Category hubs `#/anime`… | React `Header`/`Footer` | **no** |
| Explore (Trailers/Events/Merchandise) | React `Header`/`Footer` | **yes**, one adapted plate each |

Locked separation: **Kage Visual** (temple, torii, moon, maple, cut-outs,
plates, 3D wordmark) vs **Kage Behavior** (scroll→damped progress, camera,
parallax, reveal, atmosphere, particles, DPR, reduced motion). Behavior is kept
everywhere; visual only where the table allows.

## 3. The landing generator — the single most important file

`scripts/build-fandomverse-kage.mjs` reads the **untouched**
`public/landing-pages/kage.html` and writes
`public/landing-pages/fandomverse-kage.html` (generated — never hand-edit).
It applies ~18 named substitutions via `swap(label, find, replace)`.

**Three traps that have each cost a debugging cycle:**

1. **`swap()` must use a function replacer.** `String.prototype.replace` reads
   `$$`, `$&`, `` $` `` and `$'` in a *string* replacement as substitution
   patterns. The engine's `querySelectorAll` helper is `$$`, so a string
   replacement emitted `$(...)` and killed the page at boot. Already fixed —
   keep it a function.
2. **Escape backticks** inside any CSS/JS you inject: the replacement lives in
   a template literal, so a bare `` ` `` ends the string.
3. **Anchors must be unique** in `kage.html`; `swap` throws if not found.

### Kage engine facts

- `progressFor(y)` returns a **fractional chapter index (0…8)**, not 0–1. It
  returns `anchors.length - 1` = **-1** when `anchors` is empty.
- `anchors` is populated by `measure()`, which runs at boot and on resize.
- `--kage-prog` is published from the **tail of `measure()`** (seeded there so
  a deep entry/restored scroll is correct before any scroll event) *and* from
  the scroll handler. One source of truth, no extra listener.
- `#gl` (the temple canvas) fades via
  `clamp(0, calc((0.58 - var(--kage-prog,0)) / 0.34), 1)`.
- `window.__kage` exposes `{ RIG, WORLD, WORD, CAM, renderer, anchors() }` —
  use `__kage.anchors()[i]` to drive to a chapter, then wait for `--kage-prog`
  to converge. **Do not** recompute offsets yourself; lazy images shift layout
  and you will park between chapters with the reveal cascade unfired.

### CSS rules learned the hard way

- Kage declares `.sec > :not(.fg) { position: relative; z-index: 2 }` at
  specificity (0,2,0) — adaptation selectors must be `.sec > .fv-*`.
- **One mask layer per element.** Never `mask-composite`; the legacy
  `-webkit-mask-composite: source-in` erases a single-layer mask.
- **Never permanent `will-change`.** 14 promoted layers made characters vanish
  mid-scroll on a phone.
- Pseudo-elements paint **after** children at equal z-index. Chapter layer
  order: plate 0 · edge dissolve 1 · **character 2** · type 3.

## 4. Global chrome (current phase)

- Shared language in `--chrome-*` tokens (`src/styles/tokens.css`): micro-type,
  glass, hairline, bar height, gutter. **Both** Header and Footer consume it —
  do not re-declare these values locally.
- `src/hooks/useRouteAccent.ts` → `{ accentRgb, variant }` from the route.
  Accent comes from the existing `CHAPTER_ACCENT_RGB` map. Never hardcode a
  colour per page. Accent is for the active indicator, focus, hairline and a
  faint wash **only** — never text colour.
- Header is **one row**: `[BRAND] [7-link NAV] [SEARCH] [ACCOUNT]` in an
  explicit grid. Search collapses to an icon+panel **below 1280** (at 1024 the
  four regions overlap otherwise). Nav → drawer **below 1024**.
- The `Drawer` portals outside `<header>`, so it needs `--header-accent`
  scoped onto its children explicitly.

### Contracts the e2e suite depends on — do not rename

- `button[aria-label="Toggle navigation menu"]` — hidden ≥1024, visible <1024
- `dialog` named `Browse FandomVerse`
- `nav[aria-label="Fandom categories"]` — visible ≥1024, hidden <1024, and the
  active link carries `aria-current="page"`
- Category link text is exactly `Anime`, `Gaming`, `Movies`, `TV Shows`,
  `K-Pop`, `Comics`, `Manga`

## 5. Testing

```
npm run lint · npm run typecheck · npm run test · npm run build
npx playwright test --project=chromium
```

**Run a long-lived `npm run preview -- --port 4173` yourself first.**
`playwright.config.ts` has `reuseExistingServer`, and letting Playwright own
the server has repeatedly caused `ERR_CONNECTION_REFUSED` mid-run when a
previous run's server is torn down.

Current: lint/typecheck/build clean · **Vitest 142/142** · Playwright last full
run **168 passed, 9 failed, 4 flaky**.

## 5b. Final-QA session outcomes (2026-09-25)

Two **stale test contracts** were updated purposefully (neither was a product
regression; both were proven by re-running, one by stashing the changed files):

- `content-honesty.spec.ts:125` looked for a single `Log in / Sign up` button.
  The chrome unification split it into `Log in` + `Sign up` **by instruction**.
  The dialog's honesty disclaimer — the actual behaviour under test — is
  unchanged; only the locator moved.
- `keyboard-walkthrough.spec.ts:38` still entered at `/`. The file's own
  describe block already documents that these tests moved to a hub when `/`
  became the landing; this one leg was missed. On `/` the shell is stood down
  (no inline nav to tab through), the intro holds `is-locked` so Tab never
  leaves `BODY`, and once booted the landing's link reads `Anime01`, which can
  never equal `'Anime'`. Now enters at `/#/gaming`; assertions unchanged.

UI fixes in the same session: "Explore another world" links became chrome-
language chips (were default underlined blue); the header's colour emoji
became `Bookmarks` / `Cart` in the chrome micro-type (the bar's icon
vocabulary is typographic, and the visible label now equals the accessible
name); and the phone/tablet character band gained a **single-layer radial**
mask so its corners dissolve instead of reading as a pasted rectangle.

**Not changed, deliberately:** the Trailers/Events/Merchandise card thumbnails
are saturated flat blocks, but they are *authored* Phase 5 procedural SVGs
with a `credit` field — not browser defaults. Repainting them means editing
assets, which is forbidden without instruction. Flagged for a Director call.

## 6. Open items

| # | Item | Kind |
|---|---|---|
| 1 | **Fandom Core has no route.** `fandom-core.spec.ts` (8) + 1 `category-hubs.spec.ts:185` case drive it from `/`, which is now the landing. Component and unit tests still pass; nothing routes it. **Director must decide:** give it a route, or retire it with its E2E suite. | B — blocker |
| 2 | Trailers/Events/Merchandise card thumbnails are saturated flat blocks. Authored Phase 5 procedural SVGs, not browser defaults — changing them means editing assets. | Director call |
| 3 | Landscape tablet (1023×768) crops the Home chapter lead to a floating head — `16/10` at `44svh` is a letterbox on a short viewport. Outside the required viewport set. | cosmetic |

**Full Playwright regression has not been run since the header/footer work** —
the Director asked to stop after targeted QA.

## 7. Where the detail lives

- `docs/PHASE_2B_FANDOMVERSE_KAGE_MASTER_WORKLOG.md` — the authoritative
  narrative: separation table, per-phase work, the character-foreground hotfix,
  the `--kage-prog` seed, and the header/footer unification.
- `docs/11_DECISION_LOG.md` — D-032 (HashRouter), D-051…D-064.
- `docs/08_LICENSES.md` §3b — Kage MIT + the artwork permission the user
  obtained. Never invent licensor names, dates or terms.
- `docs/KAGE_FANDOMVERSE_INTEGRATION.md`, `THREEUI_KAGE_INTEGRATION_AUDIT.md` —
  why the vendored source was chosen over `@designcodeio/threeui`
  (`KageLandingPage` is an iframe with no content API).
