# Phase 2B — FandomVerse × Kage: master implementation

**Date:** 2026-09-25 · **Branch:** `master` · **Not committed.**

---

## The separation this phase enforces

**Kage Visual** — the temple, torii, vermilion moon, maple, shrine cut-outs,
the scene plates and the 3D wordmark.

**Kage Behavior** — scroll → damped progress, camera interpolation, parallax
and depth, reveal, atmosphere, particles, transitions, blur/fade, resize, DPR,
reduced motion, cinematic timing.

They are not the same thing, and the whole phase rests on keeping the second
while placing the first only where it belongs.

### Locked architecture table

| Surface | Kage Visual | Kage Behavior | Fandom Artwork | Verified |
|---|---|---|---|---|
| Home Chapter 00 | **YES** | YES | YES | `#gl` opacity 1 |
| Home Anime → Manga (01–07) | **NO** | YES | YES | `#gl` opacity 0, `kageFg` 0 |
| Category Anime → Manga | **NO** | YES | YES | `kage` count 0 at 6 viewports |
| Trailers / Events / Merchandise | **YES (adapted)** | YES | YES | one distinct Kage plate each |

---

## PHASE 0 — Audit

Read before changing anything: `KAGE_FANDOMVERSE_INTEGRATION.md`,
`FANDOMVERSE_KAGE_LANDING_WORKLOG.md`, `LANDING_STATUS.md`,
`THREEUI_KAGE_INTEGRATION_AUDIT.md`, `11_DECISION_LOG.md`, the route registry,
`categories.json`, `characters.json`, and the Kage asset tree.

**Kage scene plates actually present** — audited, not assumed:
`kage-approach`, `kage-lantern-court`, `kage-moonwater`,
`kage-sanmon-preview`. Four, not five. The fourth is Chapter 00's own preview
thumbnail, so the three Explore landings take one distinct plate each and none
is reused.

**Issue found:** the Kage canvas is `position: fixed`, full-viewport, behind
every section — so Home chapters 01–07 were reading FandomVerse's seven worlds
through a Kyoto shrine, and each chapter still carried Kage foreground
cut-outs.

---

## PHASE 2 — Home

**Files:** `scripts/build-fandomverse-kage.mjs` (→ regenerates
`public/landing-pages/fandomverse-kage.html`).

### Chapter 00 — Kage Visual kept, wordmark fixed

The temple, torii, moon, maple, foreground, particles, fog, grain, vignette,
camera and chapter rail are untouched.

**Defect:** the 3D `FANDOMVERSE` wordmark had its **F buried in the scene's
grass** and its **final E clipped by the frame**. The authored framing was
tuned for four wide letters, not eleven.

**Fix:** frame fill `.92 → .86` (narrow `.86 → .80`) and baseline lifted
`-.585 → -.44` (narrow `-.16 → -.06`). Geometry, extrusion and the per-glyph
reveal are untouched — only where the word sits and how wide it is set.
Verified at 1440×900 and 390×844: every letter legible, clear of the grass,
inside the frame.

### Chapters 01–07 — Kage Visual removed, behaviour kept

1. **Cut-outs deleted** from all seven chapter sections, and from the
   colophon, which follows Chapter 07 where the temple has already retired.
2. **The temple retires after the threshold.** The scroll handler now
   publishes `--kage-prog`, and `#gl` fades out across it. The engine keeps
   running — camera keyframes, damping, progress, parallax, reveal, particles,
   resize and DPR are all live; only the pixels stop.
3. With the temple gone the category plate is each chapter's only background,
   so its opacity went `.22 → .52`, and chapters now dissolve into one another
   at both ends instead of meeting on a horizontal seam.

**Measured:** Chapter 00 `#gl` opacity **1**; chapters 01–07 opacity **0**,
`kageFg` **0**, each carrying its own `hero-*-wide.webp` and its own lead.
Stray Kage foreground anywhere on Home: **0**.

---

## PHASE 3 — Category pages

Already Kage-free from the previous phase and re-verified here. The bleed
mechanism changed (see Phase 5) and was re-measured at all six viewports:
scene left `0`, width exactly the viewport, `kage` count **0**, no overflow.

---

## PHASE 4 — Category header

**Files:** `src/components/Header/Header.tsx`, `Header.module.css`.

Dark glass with one luminous edge, tinted by the world you are standing in.
The accent is read from the route (`CHAPTER_ACCENT_RGB`, the existing token
map — nothing hardcoded), so the header stays a leaf component: nothing has to
remember to tell it which category is open. Off a category route it falls back
to the brand primary.

- a faint accent wash drifting from the side the art sits on, purely
  atmospheric and carrying no information
- a one-pixel luminous bottom edge, brightest at centre
- an active indicator that is a **drawn** underline (`scaleX`, on the
  compositor) rather than a static border, so moving between categories reads
  as the bar following you
- accent glow on the active item only

**Legibility outranks the effect:** the tint never touches text colour. Active
link measured at `rgb(243, 245, 251)` on both Gaming and K-Pop — full
contrast, unchanged. Accent verified switching per route (Gaming
`51, 208, 255`; K-Pop `255, 93, 224`).

---

## PHASES 5–7 — Trailers, Events, Merchandise

**Files:** `src/features/explore/ExploreCinematicHero.tsx` + `.module.css`,
`explorePlates.ts`, `src/components/PagePlaceholder/PagePlaceholder.tsx`, and
the three pages.

Explore is the one surface where Kage visual is welcome: these pages are the
connective tissue of the universe rather than any particular world, so the
temple reads as FandomVerse's own atmosphere instead of another category's art.

| Surface | Plate | Accent | Eyebrow |
|---|---|---|---|
| Trailers | `kage-approach` | amber | Every world, in motion |
| Events | `kage-lantern-court` | violet | Where the fandoms gather |
| Merchandise | `kage-moonwater` | jade | Take a world home |

`PagePlaceholder` gained an optional `hero` slot that **replaces** its plain
heading rather than sitting above it, so each page keeps exactly one `<h1>`
and never states its intro twice. Every other caller is untouched.

### Defect found and fixed — full-bleed by measurement

The Events hero rendered **shifted off-screen to the left with its heading cut
away**. The break-out used `calc(50% - 50vw)`, which assumes the scene's parent
*is* the app shell's centred container. A category hero sits there; an Explore
hero is nested one level deeper inside a page section, so the offset was
wrong.

`useSceneProgress` now measures the parent's actual distance from the viewport
edge and publishes `--scene-bleed`. Both heroes cancel exactly that. Verified:
scene left `0` and width exactly the viewport at 1440, 1280, 1024, 768, 390
and 375.

---

## PHASES 8–11 — Responsive, accessibility, testing, visual QA

| Surface | Viewports checked | Result |
|---|---|---|
| Home Ch00 + Ch01–07 | 1440×900, 390×844 | temple only on Ch00; no Kage cut-out anywhere else |
| Category (Anime, K-Pop) | all six | left 0, full width, `kage` 0, no overflow |
| Explore ×3 | 1440×900, 390×844 | one `<h1>` each, correct plate decoded, atmosphere live, description readable, no overflow, header present |

Reduced motion (checked on a category hero): content fully present at
`opacity: 1`, figure `transform: none`, `animation: none`.

**Network:** master PNG requests **0** on every category and Explore page.
No CDN, no remote font. Kage plates load only on the surfaces that use them.

**Console audit across all primary routes** (run in isolation):
`CONSOLE_ERRORS: []`, `PAGE_ERRORS: []`, `FAILED_REQUESTS: []`.

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | **142 / 142** |
| `npm run build` | clean |
| `npx playwright test --project=chromium` | **169 passed, 9 failed** |

---

## PHASE 12 — Final gate

**NOT READY.** One blocker, unchanged from the previous phase and untouched by
this one.

### Blocker — the Fandom Core has no route (all 9 failures)

`fandom-core.spec.ts` (7) and one "Fandom Core integration" case in
`category-hubs.spec.ts` drive the Fandom Core from `/`, which is now the
cinematic landing. The component is still in the repository and still covered
by its unit tests (`CinematicEntry.test.tsx`, `FandomCoreFallback.test.tsx`,
`FandomCoreOverlay.test.tsx`, all passing), but nothing routes it.

Not touched, and no honest way to make them pass: they cannot be re-pointed
without inventing a route, and skipping or weakening them would hide a real
decision. **Director call required** — give the Fandom Core a route again, or
retire it together with its E2E suite.

The ninth failure, `console-audit.spec.ts`, passes in isolation with a
completely clean report; it is a timing flake under four parallel workers, not
a defect.

### Also outstanding

- A 1px line in `--color-focus` along the top of hub content, still
  unattributed: no element carries that colour as a border, outline or
  box-shadow, and `document.activeElement` is `BODY` when measured. Cosmetic.
- Data untouched: 7 categories, 35 characters, all master assets, and
  `ATTRIBUTION.txt` intact.

---

## HOTFIX VERIFICATION — CHARACTER FOREGROUND + KAGE PROGRESS SEED

**Date:** 2026-09-25 · **Not committed.** Scope: the seven chapter previews
inside the Landing `/` only. The seven Category Hubs at `/#/<category>` are a
separate surface and were re-verified untouched.

### 1. Original symptoms

1. The lead read as **printed into the plate** rather than standing in front of
   it — hair, face and jacket all had the background showing through.
2. On a phone the **type block sat on top of the character**: the description
   ran across her face, and entering a section from above showed no character
   at all.
3. The **Kage temple appeared behind chapters 01–07 on initial load**, before
   any scroll.

### 2. Root causes

Each one measured, not inferred.

| # | Cause | Evidence |
|---|---|---|
| 1 | `.fv-figure img` at `opacity: .78` | computed style; the plate composited straight through the lead |
| 2 | `.fv-sec::after` (edge dissolve) at **z-index 1, the character's own level**. As a pseudo-element of the section it paints *after* every child at equal z-index, so it laid a dark gradient across the top and bottom of the figure | `elementsFromPoint` returned `SECTION.sec` topmost at face, shoulder, torso and right edge |
| 3 | Phone: figure `position: absolute; top: 0; height: 58%` inside a `100dvh` section while the copy began at `padding-top: nav-h + 2vh` under `justify-content: flex-start` — the two bands coincide by construction | 390×844: figure `84→574`, type `131→383`, **overlap 252px**, the type block entirely inside the figure |
| 4 | Tablet: the same collision, undetected until this pass | 768×1024: figure `l:292→768`, type `l:26→742` — **450px horizontal × 231px vertical**, well past the figure's feathered left edge |
| 5 | A second `to top` mask on `.fv-figure img` erased her lower half, on top of the figure's own feather | two mask layers on the phone rule |
| 6 | `--kage-prog` was published **only inside the `scroll` listener**, never seeded. Before the first scroll event the variable is unset, CSS falls back to `0`, and `0` reads as "still in Chapter 00" | 390×844 fresh load: `#gl` opacity **1** on Chapter 01 and 02 |
| 9 | **Serious WCAG violation, pre-existing.** `splitHeadingWords()` hides every visible word span with `aria-hidden="true"` and restores the accessible name by putting `aria-label` on the `.mask-line` **span**. `aria-label` is prohibited on a span with no role | axe `aria-prohibited-attr`, impact **serious**, on `/`: `<span class="mask-line word-reveal" aria-label="Seven worlds">` |
| 8 | **Teardown race, pre-existing.** The engine is a standalone page and assumes `#hero` still exists 340ms after the preloader finishes. Inside FandomVerse it is a *route*, and `KageStage` sweeps the stage DOM on hash change — so leaving `/` inside that window left the timer dereferencing a removed node | `[pageerror] Cannot read properties of null (reading 'querySelectorAll')`, caught by `console-audit.spec.ts`, which changes route every 300ms |
| 7 | **Self-inflicted, during this hotfix:** `swap()` used `html.replace(find, replacementString)`. `String.prototype.replace` reads `$$`, `$&`, `` $` `` and `$'` in a *string* replacement as substitution patterns. The engine's `querySelectorAll` helper is `$$`, so the seed substitution emitted `$('a[href^="#"]')` — one element — and the page died at boot | `PAGEERROR $(...).forEach is not a function`; no `__kage` hook; `anchors` empty; `progressFor()` returning `-1`; `#gl` pinned at 1 on every chapter |

### 3. Fixes

- **`.fv-figure` promoted to `z-index: 2`** with `isolation: isolate`, above the
  edge dissolve at 1 and below the type at 3. `.fv-sec::after` is documented as
  deliberately beneath the character.
- **Opacity restored to 1 at every breakpoint** — desktop, tablet (was `.92`)
  and phone (was `.88`). Separation now comes from layout and one mask, never
  from fading the subject.
- **Second mask removed** from `.fv-figure img`; the figure keeps a single
  bottom feather. One mask layer per element, no `mask-composite`.
- **Stacked layout unified across `max-width: 1023px`** — the character moves
  into normal flow *above* the copy at both tablet and phone, since neither has
  the width to stand her beside a full measure. The phone block now carries only
  its own deltas (squarer `4/3` band, clamped description).
- **Franchise label scrim** — `.fv-sec .sec-head .k` gains a text-shadow so it
  survives over hair and armour. Colour untouched: `MIDNIGHT MERIDIAN` was
  rendering as `…HT MERIDIAN`.
- **Copy scrim** retained, lighter, since the copy now sits on the plate rather
  than on the character.
- **`--kage-prog` seeded from the tail of `measure()`.** Not from the nav
  wiring: `anchors` is empty until `measure()` runs, and `progressFor()` answers
  `-1` against an empty array. `measure()` already runs at boot and on every
  resize, so the seed rides the existing lifecycle and **adds no listener** —
  one runtime source of truth.
- **`swap()` hardened to a function replacer**, which is taken literally. This
  protects all sixteen substitutions, not only the one that exposed it.
- **Split headings are named by their own text.** Both the `aria-label` and the
  `aria-hidden` on the word spans were removed. Dropping the label alone would
  have left the line with *no* accessible name, since the words beneath it were
  hidden; removing both leaves the heading named by real text and no ARIA at
  all. The spaces between words are already text nodes, so the name still
  computes as "Seven worlds", not "SevenWorlds". Verified: `accessibility.spec.ts`
  **3/3 pass**.
- **Hero reveal guarded against teardown** — a null check on `#hero` before
  the reveal cascade, added as its own named substitution. The reveal simply
  has nothing left to reveal when the route has moved on.
- **Temple fade window tightened** `0.82/0.5` → `0.58/0.34`: Anime's heading was
  arriving while the shrine was still 54% visible.

### 4. Visual QA

Every row below was looked at, not only asserted. `collide` is a true
two-axis box intersection between the character and the type block.

| Surface | Viewport | `#gl` | `imgOp` | `collide` | Result |
|---|---|---|---|---|---|
| Home Ch00 | 1440×900 | 1 | — | — | PASS — temple, torii, moon, maple, grass, particles, rail; FANDOMVERSE fully legible, F clear of grass, final E inside frame |
| Home Ch01–07 | 1440×900 | 0 | 1.00 | 0 | PASS — all seven leads crisp, opaque, `blend: normal`, `filter: none` |
| Home Ch01–07 | 1280×800 | 0 | 1.00 | 63×252 px, inside the figure's feathered left edge — confirmed benign on screen | PASS |
| Home Ch01–07 | 768×1024 | 0 | 1.00 | 0 (was 450×231) | PASS after the stacked-layout fix; full description now legible below the lead |
| Home Ch01–07 | 390×844 | 0 | 1.00 | 0 (was 252) | PASS — figure `119→469` entirely above copy `519→771`; lead full-figure and crisp, label/copy/CTA readable |
| Home Ch01–07 | 375×812 | 0 | 1.00 | 0 | PASS — character band above, copy below, label/copy/CTA all readable |

No horizontal overflow at any viewport. `errs=[] failedReq=[] masterPng=0` on
every Home run.

### 5. Regression

**Category Hubs** (`/#/anime` … `/#/manga`), 1440×900 and 390×844 — all seven:

`gl 0`, `grain/vignette 0`, `kageFg 0`, `kageSec 0`, `kageStage 0`, exactly one
`<h1>` with the correct title, header present, no overflow, `errs []`,
`failed []`, `masterPng 0`, **`kagePlates []`**. No Kage visual returned.

**Explore**, both viewports — each page carries exactly its own distinct plate:

| Page | Plate requested |
|---|---|
| Trailers | `kage-approach` |
| Events | `kage-lantern-court` |
| Merchandise | `kage-moonwater` |

One `<h1>` each, no overflow, no console errors, no failed requests, zero
master PNG requests.

**Chapter 00** — unchanged at every viewport measured (`wordmark: true`,
`overflow: false`, `#gl` opacity 1, `prog 0.000`).

### 6. `--kage-prog` — runtime measurement

| Scenario | `--kage-prog` | `#gl` | Verdict |
|---|---|---|---|
| Fresh load, no scroll (Chapter 00) | `0.000` | 1 | correct — the temple belongs here |
| Deep entry: document scrolled to Manga **before** the engine wires, so no scroll event ever reaches the handler | `7.028` | 0 | correct — this is the case that was broken |
| Before the fix, same deep state | unset → CSS fallback `0` | 1 | the leak |

`hook: true` and `PAGEERROR []` in all cases.

### 6b. Automated tests — measured, not inferred

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **142 / 142** |
| `npm run build` | clean |
| `npx playwright test --project=chromium` | **168 passed, 9 failed, 4 flaky** (181 total) |

**All 9 hard failures are the one standing blocker** — 8 in `fandom-core.spec.ts`
and 1 "Fandom Core integration" case in `category-hubs.spec.ts:185`. They drive
the Fandom Core from `/`, which is now the cinematic landing.

Failures classified rather than dismissed:

| Class | Tests | Evidence |
|---|---|---|
| **B — stale test contract** | the 9 above | the component and its unit tests still pass; nothing routes it |
| **D — infrastructure / contention** | 2 × `category-hubs` Fandom Core, `deep-links #/gaming`, `keyboard-walkthrough:108` | reported **flaky**: each passed on retry. `category-hubs` tablet-768 and the landing CTA test also failed once under 4 workers and each passed twice in isolation |
| **A — real regression** | none outstanding | the two found this pass (`aria-prohibited-attr`, the teardown `pageerror`) were fixed and re-verified |

Two real defects were found by this battery and fixed, not suppressed: no
assertion was weakened, no test skipped or deleted.

### 7. Remaining issues

- **Landscape tablet (1023×768) crops the lead to a floating head.** Outside
  the required viewport set, found while probing the top edge of the new
  stacked range. `aspect-ratio: 16/10` capped at `max-height: 44svh` becomes a
  wide, short letterbox on a 768-tall viewport (≈983×338), and `object-fit:
  cover` on a square source then shows head and neck only. The previous
  side-by-side layout was not better there — it had the same text-over-character
  collision 768 had. Left as-is deliberately: all five required viewports
  verify clean, and changing the band geometry again would put them back in
  doubt. **Director's call.**
- **The phone figure band has hard left, right and top edges** against the
  plate, so it reads as a framed panel rather than a feathered cut-out. It meets
  every clarity requirement; softening it would need a radial single-layer mask
  and is a design call, not a defect. **Director's call.**
- **Standing blocker, unchanged:** `fandom-core.spec.ts` (7) and one
  `category-hubs.spec.ts` case drive the Fandom Core from `/`, which is now the
  cinematic landing. Not re-pointed and not skipped — that is a routing
  decision, not a test fix.
- The 1px `--color-focus` line along the top of hub content is still
  unattributed. Cosmetic.


---

## PHASE ADDITION — GLOBAL HEADER / FOOTER UNIFICATION

**Date:** 2026-09-25 · **Not committed.** · **Final regression NOT run** —
targeted visual QA only, by instruction.

### 1. Audit first

| Question | Answer |
|---|---|
| Where is the header rendered? | `src/layouts/RootLayout.tsx`, once. There was never more than one implementation to de-duplicate. |
| What does `/` use? | **Not** the React header. `RootLayout` stands the whole shell down on `/`, and the Kage document supplies its own `nav.nav` and colophon. So the landing's bar is the *reference*, not a consumer. |
| What is the reference made of? | `FANDOMVERSE` 12px/.26em over `PORTAL FOR FANDOM WORLD` 8px/.34em; nav links 11px/500/.2em uppercase; `rgba(5,7,10,.62)` + `blur(14px) saturate(1.1)`; a 1px hairline. |
| What was the React header? | Two rows — brand + search + visitor counter + clock + bookmarks + cart + auth, then a **ten**-link bar. The dashboard feel came from that second row and the meta group. |

**Consequence:** "three headers sharing one system" would have been an invented
abstraction — there is one React header and one vendored landing bar. The work
was therefore to make the React header *speak the landing's language*, with a
`data-variant` attribute for the only thing that genuinely differs (overlay
strength over artwork).

### 2. Files changed

| File | Change |
|---|---|
| `src/styles/tokens.css` | **new** `--chrome-*` group: the shared micro-type, glass, hairline, bar height and gutter. Defined once, consumed by both Header and Footer. |
| `src/hooks/useRouteAccent.ts` | **new.** One hook returns `{ accentRgb, variant }` from the route, so header and footer cannot disagree and the accent is not computed twice. Reads the existing `CHAPTER_ACCENT_RGB` map — no colour invented, nothing hardcoded per page. |
| `src/components/Header/Header.tsx` | rebuilt as one row; explicit grid; 7-link primary nav; search; account. |
| `src/components/Header/Header.module.css` | rewritten against `--chrome-*`. |
| `src/components/Footer/Footer.tsx` | rebuilt into brand / EXPLORE / DISCOVER / FandomVerse columns + legal row. |
| `src/components/Footer/Footer.module.css` | rewritten against `--chrome-*`. |
| `src/styles/global.css` | scoped the focus ring off the programmatic `main` target (see §6). |

Not touched: data, master assets, schema, routes, the Kage engine, the
generator, the `Drawer` / `Container` / `GlobalSearchBar` primitives. No
dependency added, no CDN, no remote font.

### 3. Desktop layout

`[BRAND] [PRIMARY NAVIGATION] [SEARCH] [ACCOUNT]` in
`grid-template-columns: auto minmax(0, 1fr) auto auto` — explicit tracks, not
`space-between`, so the four regions hold position as their contents change.
Primary navigation is the **seven worlds only**; Trailers / Events /
Merchandise moved to the footer's DISCOVER column and the mobile drawer, so
nothing became unreachable.

Active indicator: a drawn 1px underline in the category accent, animated with
`scaleX` on the compositor. No filled block.

### 4. Responsive

| Viewport | Bar | Measured |
|---|---|---|
| 1440×900 | brand · nav · search · account | `barH 64`, nav visible, no overflow |
| 1280×800 | brand · nav · search · account | `barH 61`, nav visible, no overflow |
| 1024×768 | brand · nav · **search icon** · account | `barH 61`, nav visible, no overflow |
| 768×1024 | brand · search icon · menu | `barH 73`, drawer, 10 links, no overflow |
| 390×844 | brand · search icon · menu | `barH 61`, drawer, 10 links, no overflow |
| 375×812 | brand · search icon · menu | `barH 61`, drawer, 10 links, no overflow |

Drawer: 320px, 44px touch targets, Escape closes it, focus visible; the search
panel is Escape-closable with focus returned to its control. Both verified by
interaction, not by inspection.

### 5. Category accent

From `useRouteAccent()` → the existing map. Measured switching per route:
Anime `255, 93, 115` · Gaming `51, 208, 255` · Movies `255, 182, 72` ·
TV Shows `143, 123, 255` · K-Pop `255, 93, 224` · Comics `255, 225, 77` ·
Manga `92, 230, 166`; Explore falls back to the brand `124, 141, 255`.

Used **only** on the active indicator, focus rings, the hairline edge and a
~11% atmospheric wash. It never touches text colour.

### 6. Defects found and fixed during this work

1. **The search submit was a saturated primary block** — the brightest object
   in the bar, competing with the hero and clashing with every accent. Field
   and button toned to the chrome's register; the accent appears on focus only.
2. **1024×768 overlap.** `FANDOMVERSE` painted over `ANIME` and the field
   clipped `MANGA`: the grid let the nav shrink but its links are `nowrap`, so
   they overflowed their track. The field is the utility and the navigation is
   not, so the field collapses to the icon below **1280**, returning ~200px.
3. **The drawer's active indicator was brand blue, not the category accent** —
   the Drawer renders in a portal outside `header` and so never inherited
   `--header-accent`. Scoped via a wrapper rather than by changing the shared
   primitive.
4. **The unattributed `--color-focus` rectangle is solved.** It was
   `:focus-visible` painting `--focus-ring` around the whole of `main`:
   `useRouteTransitionEffects` focuses `main[tabindex="-1"]` on every route
   change for screen reader users, and Chromium matches `:focus-visible` on it
   after a keyboard-initiated navigation. Earlier probes missed it because
   `document.activeElement` had already moved on. Scoped off that one element;
   real controls keep their ring, so NFR-002 stands.

### 7. Preservation checks

**Home `/` — untouched.** `--kage-prog 0.000`, `#gl 1`, wordmark alive, exactly
**one** header (the Kage bar, 7 links) and one footer, React shell correctly
stood down, no overflow, no errors, at both 1440×900 and 390×844. Temple,
torii, moon, maple, grass, particles, rail and all eleven letters of
FANDOMVERSE verified on screen.

**Category — no Kage visual returned.** All seven at 1440 and 390: correct
active link, correct accent, hero character crisp and clear of the bar, footer
present, no overflow, `errs []`.

**Explore — plates unchanged.** Trailers / Events / Merchandise still carry
their own adapted Kage plate; assignment untouched.

### 8. Tests run (targeted, NOT the final regression)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **142 / 142** |
| `npm run build` | clean |
| `navigation` + `responsive` + `dialog-architecture` + `accessibility` | **51 passed** |
| `console-audit` | `CONSOLE_ERRORS []` · `PAGE_ERRORS []` · `FAILED_REQUESTS []` |

### 9. Known issues

- **`keyboard-walkthrough.spec.ts:22` fails — pre-existing, not caused by this
  work.** Proven by stashing only the changed files and re-running: it fails
  identically on the baseline. It tabs 30 times on `/` while the Kage intro
  still holds `is-locked`, so focus never leaves `BODY`; and once booted, the
  landing's link text is `Anime01` (label + chapter number), which can never
  equal the `'Anime'` the test compares against. It passed in the previous full
  run by timing luck under parallel workers. **Stale test contract — Director
  decision needed:** either wait for the intro and match the landing's real
  link text, or point that leg at a Category route.
- The "Explore another world" links on hub pages and the Trailers media cards
  are still default bright blue/red — outside Header/Footer scope, but they now
  look foreign against the unified chrome.
- Bookmarks / Cart still use emoji glyphs in the bar.
- The landscape-tablet character crop and the phone figure's hard band edges
  from the previous section remain open.

### 10. Still needing the final regression

Everything above. The full Playwright suite has **not** been run since these
changes, by instruction. Outstanding from before: the 9 Fandom Core routing
failures.

---

## FINAL QA — CLASSIFICATION, FIXES AND VISUAL VERIFICATION

**Date:** 2026-09-25 · **Not committed.**

### 1. Baseline reproduced first

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | 142 / 142 |
| `npm run build` | clean |
| `npx playwright test --project=chromium` | **168 passed · 8 failed · 5 flaky** (181) |

The 8 hard failures were 7 × `fandom-core.spec.ts` (the standing routing
blocker) plus **one new** failure, `content-honesty.spec.ts:120`.

### 2. Failures classified — none was a product regression

| Test | Class | Evidence |
|---|---|---|
| `fandom-core.spec.ts` ×7 | **B — stale contract / blocker** | drive the Fandom Core from `/`, which is now the landing. Component and its unit tests still pass; nothing routes it. Untouched. |
| `content-honesty.spec.ts:120` | **B — stale contract** | looked for one `Log in / Sign up` button. The chrome unification split it into `Log in` + `Sign up` **by instruction**. The dialog disclaimer under test is unchanged. |
| `keyboard-walkthrough.spec.ts:22` | **B — stale contract** | still entered at `/`. See §3. |
| `category-hubs.spec.ts:185` ×3, `deep-links.spec.ts:35`, `landing.spec.ts:106` | **D — flaky** | reported flaky; each passed on retry. |

### 3. `keyboard-walkthrough` — the door was never moved

The file's own describe block states these tests moved off `/` when it became
the cinematic landing. One leg was missed. It matters three ways, and together
they explain why it passed or failed by machine speed:

1. `/` stands the shell down, so the inline category nav the leg exists to
   exercise is not on the page;
2. during the intro the engine holds `is-locked` on `<body>` and Tab never
   leaves `BODY` — measured: focus stayed on `BODY` for 14 consecutive Tabs;
3. once booted, the landing's own link reads `Anime01` (label + chapter
   number), which can never equal the `'Anime'` compared against.

Proven pre-existing by stashing only the changed files and re-running: it
failed identically on the baseline. Now enters at `/#/gaming` so that "Anime"
is a real destination. **Every assertion unchanged**, and the accessibility
behaviour actually under test — tab reach and visible focus — is preserved.

### 4. UI fixes

| Item | Was | Now |
|---|---|---|
| "Explore another world" | default `--color-primary` blue, browser-underlined — the loudest thing below the fold | chrome-language chips: uppercase micro-type, hairline pill, accent on hover/focus |
| Header bookmark / cart | full-colour emoji, the only saturated objects in a monochrome bar | `Bookmarks` / `Cart` in the chrome micro-type. The bar's icon vocabulary is already typographic, and visible label now equals accessible name |
| Phone + tablet character band | bottom-only linear feather, so top and sides were hard cuts and the band read as a pasted rectangle | **one** radial mask feathering all four edges. Still one layer, still no `mask-composite` |

**Deliberately not changed:** the Trailers/Events/Merchandise thumbnails are
saturated flat blocks, but they are *authored* Phase 5 procedural SVGs carrying
a `credit` field — not browser defaults. Repainting them means editing assets.
**Director call.**

### 5. Visual QA — looked at, not just asserted

| Surface | Viewports | Result |
|---|---|---|
| Home Ch00 | 1440, 1024, 390 | temple, torii, moon, maple, particles, rail; **FANDOMVERSE all 11 characters**, clear of grass, final E inside frame |
| Home Ch01 / 04 / 07 | 1440, 1024, 768, 390 | `#gl 0`, `imgOp 1.00`, `kageFgInSec 0`, leads crisp, copy legible |
| Category ×7 | 1440, 1024, 390 | `gl 0 · kageFg 0 · kageSec 0`, correct accent, character clear of the bar |
| Explore ×3 | 1440, 1024, 390 | own plate each, header/footer unified |

The 1024 Home chapters report a `198 × 242` box overlap between copy and
figure. Checked on screen: it falls inside the figure's feathered left edge, no
text sits on painted character — benign, same as 1280.

### 6. Network / console

`errs [] · failed [] · masterPng 0` on every Category and Explore page at
1440, 1024 and 390, and on Home at every viewport. Independent
`console-audit.spec.ts`: `CONSOLE_ERRORS []`, `PAGE_ERRORS []`,
`FAILED_REQUESTS []`.

### 7. Final regression (after all fixes)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **142 / 142** |
| `npm run build` | clean |
| `npx playwright test --project=chromium` | **164 passed · 15 failed · 2 flaky** (181) |
| `console-audit.spec.ts` (isolated) | `CONSOLE_ERRORS []` · `PAGE_ERRORS []` · `FAILED_REQUESTS []` |

**All 15 failures are the one blocker**: 8 × `fandom-core.spec.ts` and 7 ×
`category-hubs.spec.ts:185` "Fandom Core integration". Both suites drive the
Fandom Core from `/`, which is now the cinematic landing. Nothing else fails.

The count moved from 8 to 15 against the baseline only because the seven
`category-hubs:185` cases — the *same* blocker — failed outright this run
instead of passing on retry. They flip between "failed" and "flaky" with
timing; they are one defect, not two.

The 2 flaky (`content-honesty.spec.ts:75`, `landing.spec.ts:51`) were re-run in
isolation and **both passed** — 22/22 and 1/1. Class **D**.

Both contract fixes hold: `content-honesty.spec.ts` + `keyboard-walkthrough.spec.ts`
= **32 passed** together.

### 8. Remaining

- **Fandom Core routing blocker** — unchanged, Director decision required:
  give the Fandom Core a route, or retire it with its E2E suite. Not
  re-pointed and not skipped.
- Trailers/Events/Merchandise thumbnail art — Director call (above).
- Landscape tablet 1023×768 Home crop — outside the required viewport set.

### 9. Verdict

**NOT READY** — solely because of the Fandom Core blocker. Every other gate is
met: lint, typecheck, Vitest, build, console, network, Kage separation,
header/footer consistency and visual QA all pass. The blocker is a routing
decision, not an implementation defect, and cannot be closed without one.
