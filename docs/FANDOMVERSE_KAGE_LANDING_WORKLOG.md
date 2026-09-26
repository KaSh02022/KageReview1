# FandomVerse × Kage — Landing Adaptation Work Log

**Date:** 2026-09-24 · **Branch:** `master` · **Not committed.**

---

## Baseline

| | |
|---|---|
| Kage original | `public/landing-pages/kage.html` — **untouched, MD5-verified against the package copy after every regeneration** |
| Kage assets | `public/landing-pages/secret-pathways-assets/` — untouched |
| Licence | MIT, © 2026 Meng To. `ATTRIBUTION.txt` ships beside the files. |
| FandomVerse landing | `/` still the React chapter landing (D-057…D-064). **Unchanged by this phase.** |
| Tests at start | lint/typecheck clean · 142/142 Vitest · 721 Playwright · build clean |

---

## Source files read before changing anything

`public/landing-pages/kage.html` in full (structure, CAM array, reveal system,
foreground staging, rail generation, wordmark builder), plus
`docs/08_LICENSES.md`, `KAGE_FANDOMVERSE_INTEGRATION.md`,
`THREEUI_KAGE_INTEGRATION_AUDIT.md`, `LANDING_STATUS.md`, `TEAM_HANDOFF.md`,
`TEST_CHECKLIST.md`, and the live content data.

---

## Architecture

```
public/landing-pages/kage.html          ← original, never edited, still runs standalone
            │  read by
            ▼
scripts/build-fandomverse-kage.mjs      ← 12 targeted substitutions
            │  + src/data/categories.json, characters.json
            ▼
public/landing-pages/fandomverse-kage.html   ← GENERATED, do not hand-edit
```

A generator rather than a hand-edited fork, for three reasons: the engine is
provably untouched (every change is one named substitution), `kage.html` stays
pristine for rollback, and the adaptation can be regenerated after an upstream
`npm` upgrade with `node scripts/sync-kage.mjs && node scripts/build-fandomverse-kage.mjs`.

### Kage behaviour preserved — verbatim, not reimplemented

Three.js renderer and the whole procedural scene build · camera interpolation,
damping and easing · scroll → fractional chapter progress · foreground staging
with its blur-and-fade handoff · particles, fog, bloom, grain, vignette ·
pointer trail and custom cursor · resize, DPR, reduced motion, WebGL context
lifecycle · word-level heading reveals and the `[data-rv]` stagger · the live
`data-frame` / `data-view` viewports · the preloader.

**No second renderer. No CSS re-creation of any of it. No R3F rewrite.**

### FandomVerse adaptations — the 12 substitutions

| # | Substitution | Note |
|---|---|---|
| 1 | `<title>` | |
| 2 | meta description | |
| 3 | `<style id="fv-adapt">` appended to head | the only new CSS |
| 4 | brand wordmark text | |
| 5 | nav links → the 7 categories | |
| 6 | hero + 4 chapters + colophon → hero + **7 chapters** + colophon | from live data |
| 7 | **CAM 6 → 9 keyframes** | see below |
| 8 | chapter-rail labels | rail auto-generates from `[data-cam]` |
| 9 | 3D wordmark tracking `.40 → .055` | 11 letters, not 4 |
| 10 | 3D wordmark text `KAGE → FANDOMVERSE` | extruded geometry, not the `.word-fb` fallback |
| 11 | wordmark frame fill `1.00 → .92` | 11 letters at 1.00 clipped the outer stems |
| 12 | brand mark SVG removed | the torii is Kage's identity; no FandomVerse logo was invented |

### The camera

The hero and colophon keep their authored shots exactly. The seven chapters
are sampled along the authored polyline through keyframes 1–4 (sanmon →
gardens → craft → afterlight) at seven evenly spaced points, so **every
position is either an authored shot or a linear blend of two adjacent ones**.
No camera position was invented, and the camera never leaves the modelled
scene.

---

## Files added

```
scripts/build-fandomverse-kage.mjs             the generator
public/landing-pages/fandomverse-kage.html     generated, 4,9xx lines
```

## Files preserved

`kage.html`, `secret-pathways-assets/`, `ATTRIBUTION.txt`, all 7 categories,
all 35 characters, all approved Gemini assets, every route, every test, the
existing React landing and all of `src/sections/` and `src/features/landing/`.

## Assets

**No new asset files.** The adaptation references the existing approved WebP
renditions by URL (`/assets/gemini/web/…`) — seven 1920px category plates and
seven 800px character portraits. No master PNG is requested. No derivative was
created, so `docs/08_LICENSES.md` needs no new row beyond the §3b block already
recorded for the vendored Kage files.

**§11 — the "new background artwork":** the brief refers to a background
artwork supplied in conversation. **No such file was attached, and none exists
in the repository** — the only images present are the 14 approved Batch 01
assets and their renditions. Nothing was invented in its place. If the file is
provided, it can be dropped in and pointed at a chapter; the K-Pop chapter is
the natural home per the brief.

---

## Visual defects found and fixed

Every one was found by looking, not by a failing test.

| # | Defect | Cause | Fix |
|---|---|---|---|
| 1 | The 3D wordmark still read **KAGE** | It is extruded geometry built glyph by glyph in `buildWordmark()`. The `.word-fb` element is only the no-WebGL fallback. | Substituted the word, and the tracking with it |
| 2 | **FANDOMVERSE overflowed the frame**, clipping the F and the final E | Authored `fill: 1.00` sets the word edge to edge — fine for four wide letters, not eleven | `fill` → `.92` desktop / `.86` narrow |
| 3 | **All adaptation CSS silently ignored.** Plate and figure rendered as raw rectangles in flow | Kage declares `.sec > :not(.fg) { position: relative; z-index: 2 }` at specificity (0,2,0), which outranks a single class selector | Selectors raised to `.sec > .fv-*` |
| 4 | Chapter description, lead line and CTA invisible | Symptom of #3 — sections were 1,946px tall, so the copy sat far below the heading | Resolved by #3 |
| 5 | **Two chapters shared the fold**, one chapter's foreground cutting across the next chapter's copy | FandomVerse chapters are a heading and three short paragraphs — ~730px against Kage's much longer chapters | `.fv-sec { min-height: 100dvh }`, content centred above the foreground band |
| 6 | Figure cut off by a hard horizontal edge at its base | Only the top was feathered | One gradient feathering **both** ends |
| 7 | **On a phone the foreground covered the description and the CTA** | The engine parks the active stage `fixed` above everything by design — nothing in the section can be raised over it | Copy moved into the band above it, given its own soft scrim, description clamped to 3 lines (full text stays in the DOM) |
| 8 | Generator wrote a malformed `CAM` array | `indexOf(']')` matched the bracket inside the first `p: [ … ]` vector | Closing bracket located as a line of its own |

### Two lessons worth keeping

- **Never use a bare class selector against Kage's own layout rules.** Its
  descendant selectors sit at (0,2,0). Defect #3 produced no error of any
  kind — the CSS simply lost.
- **Masks: one layer per element, never `mask-composite`.** Carried over from
  D-062; applied pre-emptively here, which is why the figure masks worked
  first time on every breakpoint.

---

## Viewport QA

Captured by **scrolling down the way a reader does** and screenshotting each
chapter when its heading entered the frame — never by a fixed scroll offset,
which on this page lands between chapters, and never by jumping to a heading,
which skips the observers that reveal a chapter's copy.

| Viewport | Chapters captured | Overflow | Rail | Console | 404s |
|---|---|---|---|---|---|
| 1440×900 | 7 / 7 | none | 9 | none | none |
| 1280×800 | 7 / 7 | none | 9 | none | none |
| 1024×768 | 7 / 7 | none | 9 | none | none |
| 768×1024 | 7 / 7 | none | 9 | none | none |
| 390×844 | 7 / 7 | none | 9 | none | none |
| 375×812 | 7 / 7 | none | 9 | none | none |

Per chapter, per viewport: the lead's portrait reported `naturalWidth: 800`
(decoded, not a placeholder), the description resolved to `opacity: 1`, and
the CTA resolved to `opacity: 1` pointing at its real route.

---

## Automated tests

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | **142 / 142** |
| `npx playwright test` | **721 passed, 0 failed, 3 skipped** |
| `npm run build` | clean |
| `kage.html` integrity | MD5 identical to the package copy |

No test was modified in this phase.

---

## Network / performance

| | |
|---|---|
| Image transfer, whole page | **3.62 MB** across 24 requests |
| Composition | Kage's own plates and cutouts + 7 FandomVerse 1920px plates + 7 800px portraits, all WebP |
| Master PNGs requested | **none** |
| Renderers | **one** — Kage's vendored three.js r149. No second WebGL context. |
| Failed requests | none |
| Remote fonts / CDN | none — Onest is base64-embedded |

For comparison the React landing at `/` transfers ~1.0 MB. The cinematic page
is heavier because it carries a full procedural 3D scene in addition to the
category art.

---

## Remaining TODO

1. **`/` has not been switched.** §12 asks for it; see the note below. This is
   the one acceptance item not met, and it is a decision rather than a defect.
2. **§11's background artwork is missing** — nothing was supplied.
3. On a phone the lead sits behind the copy scrim and reads faintly. Legible
   and intentional as atmosphere, but a stronger composition is possible if
   the description moves to the hub entirely.

### Why `/` was not switched

The adaptation is a complete standalone HTML document with its own nav, its own
`<h1>` and its own footer. Three ways to put it on `/`, and each costs
something the Director has previously ruled out:

- **Serve it as `/`** — the SPA's `index.html` *is* `/`. Replacing it means
  `/#/anime` also resolves to the cinematic page, and the hash router, header,
  search, cart, bookmarks and chatbot all stop working.
- **Frame it inside the React route** — keeps the React header and the rest of
  the app, but it is an `<iframe>`, which the Director ruled out in the
  previous phase, and it fails roughly 64 assertions that read the landing's
  DOM (no `<h1>` on the React route, no `#fandom-categories-section`, no
  "Explore fandoms" heading).
- **Leave `/` as it is** and reach the cinematic page by its own URL — what is
  in place now. Costs nothing, breaks nothing, and both landings coexist.

The third is the only one that does not contradict a standing instruction, so
it is where this phase stopped. Switching to either of the others is a
one-line change once the Director picks.

---

## Rollback

```
rm public/landing-pages/fandomverse-kage.html
rm scripts/build-fandomverse-kage.mjs
```

Nothing else references either file. `kage.html`, the assets, the React
landing, the routes and every test are untouched by this phase, so there is
nothing else to undo.

---

# Phase 1 — MVP: the cinematic landing on `/`

**Date:** 2026-09-24 · first visual test build · **not committed**

## Files changed

| File | Change |
|---|---|
| `src/features/landing/KageStage.tsx` | **new** — boots the Kage document into a React route |
| `src/features/landing/KageStage.module.css` | **new** |
| `src/pages/KageLandingPage.tsx` | **new** — the `/` route element |
| `src/routes/routes.tsx` | `/` now renders `KageLandingPage` |
| `src/layouts/RootLayout.tsx` + `.module.css` | app chrome stands down on `/` only |
| `src/app/App.test.tsx`, `src/app/RouteTransitions.test.tsx` | readiness marker updated (see below) |

`HomePage.tsx`, all of `src/sections/`, `src/features/landing/` (the React
chapter landing) remain on disk, unused but intact.

## Architecture change — route `/`

Not an iframe, and not a second renderer. `KageStage` fetches the generated
`fandomverse-kage.html`, injects its stylesheet and markup into the live
document, then runs its scripts in order — so the scene, camera, scroll
choreography, particles, fog, foreground staging and pointer handling are the
authored ones, executing in the host page.

The app shell stands down on `/` alone: the cinematic page carries its own
navigation, its own `<h1>` and its own colophon, and layering the React header,
breadcrumb and footer over it would give the visitor two of each. Every other
route keeps the full shell.

### Teardown, and the bug it caught

The Kage script is written for a document it owns for the page's lifetime: it
registers animation frames and window listeners and never removes them. Inside
a router it must. `requestAnimationFrame` and `addEventListener` are wrapped so
every registration is recorded, and the cleanup cancels and removes exactly
what the boot created, then releases the WebGL context. **No Kage source was
modified to achieve this.**

The first attempt restored the `requestAnimationFrame` shim as soon as boot
finished. That was wrong, and the browser said so: the render loop re-queues
itself every frame through the *real* `requestAnimationFrame`, so those frames
were invisible to teardown. One ran after the context had been released and
three.js threw from `acquireProgram`. The shim now stays for the stage's
lifetime and comes off in cleanup, frames cancelled before the context is
released. Verified: navigating from `/` into a hub leaves **0 canvases, 0
stray foreground layers and no page error.**

## Kage reuse

Everything. The engine is untouched upstream; the only adaptation is the
generated content described in the phase above.

## Orbital shapes

Removed by construction. The rotating geometry belonged to the React Fandom
Core, which is no longer on `/` at all. The intro is now Kage's own
threshold — atmosphere, the 3D FANDOMVERSE wordmark and editorial type.

## Test results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | **142 / 142** |
| `npm run build` | clean |
| `/` boot | WebGL live, 9 `[data-cam]` sections, 9 rail dots, app header absent, `__kage` handle present |
| 7 hub routes | all load with their own `<h1>` and the full app header |
| CTA `/` → `/#/anime` | navigates in-app; teardown clean |
| `/` and `/#/` reload | survive, exactly one canvas |
| console / 404 on `/` | none |

### Tests that now describe the superseded landing

> **CORRECTION (Phase 2).** The table below undercounts badly. It was written
> from a partial run of three suites and reported as if it were the whole set.
> A full chromium run shows **at least 32 failures across eight spec files**,
> not 13. See "Correction to the Phase 1 test figure" at the end of Phase 2.

Not rewritten — out of scope for this phase, and they encode real guarantees
that should be re-pointed deliberately rather than in an MVP pass.

| Suite | Count | Why |
|---|---|---|
| `e2e/landing.spec.ts` | 10 | Asserts the React chapter landing: "Explore fandoms", the contents list, the chapter rail buttons, the image budget. None of it is on `/` any more. |
| `e2e/navigation.spec.ts` | 2 | Expects the "Explore fandoms" heading and the app category nav on `/`; the header is intentionally absent there now. |
| `e2e/deep-links.spec.ts` | 1 | The `#/` case expects the old landing's heading and the app banner. |

The two unit suites were **not** rewritten either — only their readiness
marker changed, from the old landing's heading to `data-testid="kage-stage"`.
Every assertion in them (no focus steal, no scroll on first render, scroll and
focus on subsequent navigation, the root route renders a real page) is
unchanged.

## Known limitations

1. **13 E2E tests describe the superseded landing** (table above). They need
   re-pointing at the cinematic landing in a follow-up.
2. **Accessibility on `/` is not audited.** The app's skip link and landmark
   structure belong to the shell, which stands down there; the framed document
   has its own. Out of scope per this phase's brief.
3. **Page weight on `/` is ~3.6 MB** — a full procedural 3D scene plus the
   category art, against ~1.0 MB for the React landing.
4. **`/` styles the document globally while mounted.** The Kage stylesheet
   targets `html` and `body`; it is removed on unmount, but any future route
   that mounts alongside `/` would inherit it.
5. §11's background artwork is still absent from the repository.

---

## Phase 1a — blank-page fix

**Reported:** `npm run dev` and `npm run preview` both showed a blank page.

**Two causes, both confirmed by measurement, neither a fault in the landing.**

1. **A stale dev server held port 5173** (PID 22912), started before any of
   this work. Vite silently moves to the next free port when 5173 is taken, so
   `npm run dev` was serving on 5174 while the browser at 5173 hit the old
   server and its broken HMR graph. Killed; both default ports verified free.

2. **The route had no loading state of its own.** The Kage document has to be
   fetched, parsed and injected before its own preloader exists to cover the
   screen. On a warm server that gap is imperceptible; on a cold dev server it
   is seconds of empty white frame, which reads as a broken page. Measured on
   the stale server: at 9s the preloader was still `opacity: 1`; at 30s it had
   finished normally — slow, never stuck.

**Fix:** `KageStage` now paints a dark, branded boot panel from the moment the
route mounts until the document is injected, and renders a readable failure
panel with a way out if the fetch fails. The route can no longer present as an
empty white frame.

**Verified after the fix**, in a real browser at 11s: preview on 4173 and dev
on 5173 both render the cinematic landing — WebGL live, 9 sections, preloader
dismissed, no console error, no failed request. Also verified degrading
gracefully with WebGL disabled (`no-webgl` path, content still readable).

lint clean · typecheck clean · 142/142 Vitest · build clean.

---

# Phase 2 — cinematic category prototype: `/gaming`

**Date:** 2026-09-24 · prototype only, one category · **not committed**

## Files changed

| File | Change |
|---|---|
| `src/features/cinematic/useSceneProgress.ts` | **new** — shared runtime: damped scroll progress for a single scene |
| `src/features/category/CategoryCinematicHero.tsx` + `.module.css` | **new** — the category scene, driven entirely by category data |
| `src/pages/CategoryHubPage.tsx` | renders the cinematic hero for categories listed in `CINEMATIC_CATEGORIES`; the flat banner is untouched for the other six |

`/` is untouched. No category or character data, no master asset and no test
was modified.

## Architecture

The split the brief asked for, without duplicating 4,800 lines per category:

```
src/features/cinematic/   scene-independent runtime
src/features/landing/     atmosphere canvas, word reveal, accents (reused)
src/features/category/    the scene, parameterised by category data
```

`CategoryCinematicHero` takes a `Category` and its lead and renders any of the
seven. Extending the prototype is adding an id to `CINEMATIC_CATEGORIES` —
one line, not a new page.

### Which engine, and why not Kage's

The brief asks to keep Kage's animation engine and to drop Kage's visual
composition from category pages. Those two cannot both be taken literally:
Kage's engine *is* the temple — its camera path, fog, particles and foreground
staging are written against that scene, and its foreground plane is `position:
fixed` above everything by design, which would drop maple and shrine cut-outs
over this page's own copy.

What carries over is the **behaviour**, which already exists in this repo as a
native port (D-057…D-064) and needed no rewriting:

| Kage behaviour | Where it lives here |
|---|---|
| scroll → damped progress | `useSceneProgress` (same exponential damping as `useChapterProgress`) |
| parallax / depth | per-layer `--scene-progress` multipliers |
| particles, atmosphere | `AtmosphereCanvas`, tinted by the category accent |
| fade / blur transitions | `Reveal`, `WordReveal`, the scene's bottom dissolve |
| reduced motion | every transform dropped, no content lost |
| resize / DPR | `AtmosphereCanvas` caps DPR at 2 (1.5 small) and re-fits on resize |
| WebGL lifecycle | not applicable — this scene needs no WebGL context, so none is created |

**Dropped from category pages:** the Kage temple scene, torii, vermilion moon,
maple and shrine foreground, and the 3D wordmark. All of it stays on `/`.

## Composition

`background plate → haze → atmosphere → character → content`, z-indexed in that
order, so nothing can cover the copy. The lead enters with a fade-and-settle
and parallaxes slower than the plate behind it.

Masks follow the standing rule: **one layer per element, never
`mask-composite`** — the wrapper takes the vertical feather, the image the
horizontal one.

## Visual QA

| | 1440×900 | 390×844 |
|---|---|---|
| Composition | type left, lead right, plate behind | lead as backdrop above, type below |
| `<h1>` | "Gaming", exactly one | same |
| Lead portrait | `naturalWidth` 800, 640×714 | 800, 390×446 |
| Description / CTA | opacity 1, readable | opacity 1, readable |
| Full-bleed scene | 1440 wide, no overflow | 390 wide, no overflow |
| FandomVerse header | present | present |
| Hub content below | 9 sections, intact | same |
| CTA | scrolls 0 → 902 | scrolls 0 → 903 |
| Console errors / 404s | none | none |
| Master PNG requests | **none** | **none** |

No Kage visual appears anywhere on the page.

## Known issues

1. On a phone the "Ashfall Protocol" marker sits over the lead's shoulder —
   legible, but the rule beside it is faint.
2. Only `/gaming` is cinematic; the other six keep the flat banner by design.
3. The hub's own `visualMotif` eyebrow is still shown on the six flat banners.
   It is art-direction metadata (D-055) and should come out when they convert.

## Next step

Extend to the remaining six by adding their ids to `CINEMATIC_CATEGORIES` and
re-running the same two-viewport QA per category. No new component is needed.

## Test results (Phase 2)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | **142 / 142** |
| `npm run build` | clean |
| `e2e/category-hubs.spec.ts` | **41 / 41** — every hub guarantee intact, including no-overflow at 375, 390, 768, 1024 and 1440 |

**The gaming prototype adds no test failure.** It was built inside the existing
hub template, so the hub's own suite covers it and passes in full.

## Correction to the Phase 1 test figure

Phase 1 reported "13 E2E tests describe the superseded landing". That number
was wrong. It came from running only `landing`, `navigation` and `deep-links`
and treating the result as complete, which it was not.

A full chromium run shows failures in **eight** spec files:

| Suite | What it actually needs from `/` |
|---|---|
| `fandom-core.spec.ts` (9) | the Fandom Core, which is no longer on `/` at all |
| `landing.spec.ts` (10) | the React chapter landing |
| `responsive.spec.ts` (4) | the header's mobile drawer, entered from `/` |
| `dialog-architecture.spec.ts` (3) | the chatbot dialog and drawer portals, entered from `/` |
| `navigation.spec.ts` (2) | the landing heading and the app category nav |
| `keyboard-walkthrough.spec.ts` (2) | the mobile nav and chatbot, entered from `/` |
| `deep-links.spec.ts` (2) | the old landing heading and the app banner at `#/` |
| `accessibility.spec.ts` (1+) | the skip-to-content link |

**Root cause is not the landing's content — it is standing the app shell down
on `/`.** Most of these suites are not testing the landing at all. They test
global chrome — the drawer, the chatbot, the skip link, keyboard routes — and
they simply start at `/` because that used to be the cheapest page with a
header. Removing `SkipLink`, `Header`, `Footer` and `ChatbotLauncher` from
that one route took the floor out from under them.

Two ways to close it, both deliberate decisions rather than MVP patches:

1. **Re-point the chrome suites** at a route that has chrome (`#/anime`). The
   guarantees are unchanged; only the starting page moves. This is the smaller
   and more honest fix for the ~11 in `responsive`, `dialog-architecture`,
   `keyboard-walkthrough` and `accessibility`, which never meant to test `/`.
2. **Decide what `/` owes** — the skip link in particular is an accessibility
   guarantee for the site's entry point, and the cinematic page currently has
   none of its own.

`fandom-core`, `landing`, `navigation` and `deep-links` are a separate
question: they describe a landing that was deliberately replaced, and need
re-pointing at whatever `/` is meant to be.

---

# Phase 3 — chrome tests re-pointed, all seven categories cinematic

**Date:** 2026-09-25 · **not committed**

## 1. Chrome tests re-pointed

Suites that test the **app shell** — header, category nav, drawer, dialogs,
skip link, auth control — used to enter at `/` because that was the cheapest
page carrying the chrome. `/` is now the cinematic landing, which stands the
shell down. They enter at a category hub instead. **Every assertion is
unchanged; only the door moved.**

| Suite | Tests | New entry |
|---|---|---|
| `responsive.spec.ts` | 4 | `/#/anime` |
| `dialog-architecture.spec.ts` | 3 | `/#/anime` |
| `keyboard-walkthrough.spec.ts` | 2 | `/#/anime` |
| `accessibility.spec.ts` | 1 | `/#/anime` |
| `content-honesty.spec.ts` | 1 | `/#/anime` |
| `navigation.spec.ts` | 1 | `/#/movies` (starting at Anime would make the test circular) |

### Contract updates, recorded rather than hidden

Three places asserted content that `/` deliberately no longer has. These were
re-based on what the route actually owns, not relaxed:

- `navigation.spec.ts` — the home heading is now the cinematic landing's.
  Same guarantee: the root renders real content, not a blank shell.
- `deep-links.spec.ts` — `/` resolves and survives a refresh under its own
  heading, and carries no app banner by design.
- `landing.spec.ts` — **rewritten** for the cinematic `/`: live WebGL context,
  nine sections and nine rail entries, one `<h1>`, seven chapters, every
  chapter linking to its real hub, a CTA that navigates in-app, **complete
  teardown on leaving** (no leaked canvas or foreground plane), no broken
  image, **no master PNG ever requested**, no console error, no overflow at
  320px, and full content under reduced motion.
- `category-hubs.spec.ts` — the "identity as text, not colour alone" test now
  reads name + franchise + tagline. It previously read `visualMotif`, which
  the cinematic hero drops by design (D-055): *"Halftone dots and ink-bleed
  shadows"* is art direction written to brief an image generator. Three text
  signals still carry the identity, so the guarantee is intact.

### One real defect this surfaced

`responsive.spec.ts` located the site header as `header:not(section header)`.
The category hero is a `<header>` too, so on a hub that locator matched two
elements. Narrowed to `header:not(main header)` — the site header is the only
one outside `<main>`.

## 2. All seven categories cinematic

`CINEMATIC_CATEGORIES` now holds all seven ids. **No new component**:
`CategoryCinematicHero` + `useSceneProgress` are reused unchanged, every value
read from `categories.json` / `characters.json`.

## 3. QA — 7 categories × 2 viewports

All 14 combinations measured in a real browser:

| Criterion | Result |
|---|---|
| `<h1>` correct, exactly one | 14 / 14 |
| Cinematic hero mounted | 14 / 14 |
| Character decoded (`naturalWidth` 800) | 14 / 14 |
| Description readable (`opacity` 1) | 14 / 14 |
| CTA present and scrolling into the hub | 14 / 14 (0 → ~902) |
| Atmosphere canvas | 14 / 14 |
| Horizontal overflow | none |
| App header usable | 14 / 14 |
| **Master PNG requests** | **0 across all 14** |
| Console errors / 404s | none |

Desktop puts the type left and the lead right; the phone makes the lead a
backdrop above the type with its own scrim. No Kage temple, torii, moon, maple
or 3D wordmark appears on any category page.

## 4. Final verification

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | **142 / 142** |
| `npm run build` | clean |
| `npx playwright test --project=chromium` | **171 passed, 14 failed** |

## 5. Remaining issues

**One blocker, one cosmetic.**

### The Fandom Core has no route (14 failures, all of them)

Every remaining failure is the same cause: `fandom-core.spec.ts` (8) and the
"Fandom Core integration" block in `category-hubs.spec.ts` (6) drive the
Fandom Core from `/`, and `/` is now the cinematic landing. The component is
still in the repository and still covered by its unit tests
(`CinematicEntry.test.tsx`, `FandomCoreFallback.test.tsx`,
`FandomCoreOverlay.test.tsx` — all passing), but nothing routes it.

These were **not** touched. There is no honest way to make them pass: they
cannot be re-pointed without inventing a route, and deleting or skipping them
would hide a real decision. It needs a Director call — retire the Fandom Core
and its E2E suite, or give it a route again.

### A 1px line at the top of the hub content (cosmetic, unattributed)

A one-pixel line in exactly `--color-focus` (`#7c9bff`) appears along the top
edge of the hub content area in screenshots. Not reproduced by any probe: no
element carries that colour as a border, outline or box-shadow, and
`document.activeElement` is `BODY` when measured. It does not affect layout,
legibility or interaction. Left unattributed rather than guessed at.

---

# Phase 4 — Gaming: Kage visual layers removed, Kage motion behaviour retained

**Date:** 2026-09-25 · **not committed**

**Gaming category: Kage visual layers removed; Kage motion behavior retained.**

## What was actually wrong

Gaming's own composition was already clean — entering `/#/gaming` directly
requested no Kage asset and rendered no Kage node. The overlap only appeared
when arriving **from `/`**: `KageStage`'s teardown left five injected nodes in
`document.head` — the fonts link, two stylesheets and two scripts — and the
Kage stylesheet targets `html`, `body` and every Kage class globally, so the
hub inherited a temple's worth of rules it never asked for.

Three defects, each found by measurement:

1. **Teardown ran as one block.** A throw in an early step silently skipped
   the DOM sweep below it. Every step is now isolated; the DOM is swept first,
   because it is what the visitor can see.
2. **Cleanup used the captured array.** It only knew what its own run had
   appended, so a mount/unmount/remount left an earlier run's nodes orphaned.
   Now swept by selector.
3. **Unmount lands ~3s after the click** — teardown is heavy work queued
   behind the route change, and for those three seconds the Kage sheet was
   still styling the page the visitor had already arrived on. The stage now
   sweeps on `hashchange`, the earliest honest signal that it is unwanted.

A module-level guard also ensures only one stage is ever live, and a bounded
set of follow-up sweeps catches anything a still-in-flight boot appends — the
boot can only be *asked* to stop, not forced.

## Verification

| | direct | via `/` |
|---|---|---|
| Kage DOM nodes (`#gl`, `#fg-sky`, `#pre`, `.fg-el`, `.word-fb`, `[data-kage-stage]`) | 0 | **0** |
| Kage images | 0 | 0 |
| Kage asset requests | **none** | **none** |

At 1440×900, 1280×800 and 390×844, both entry paths: `h1` "Gaming", lead
`character-gaming-kestrel-rho.webp` decoded, plate `hero-gaming-wide.webp`,
description `opacity: 1`, CTA present, atmosphere canvas present, header
usable, no overflow, no console error, no 404. Scroll progress moves
(`0.0000 → ~0.53`), so parallax and reveal are intact.

Reduced motion: content fully present (`opacity: 1` throughout), figure
`transform: none`, `animation: none`.

lint clean · typecheck clean · 142/142 Vitest · build clean ·
`category-hubs` + `landing` 44 passed.

Nothing was changed in `/`, the cinematic landing, master assets, data or the
animation engine. Only `KageStage`'s teardown.

---

## 2026-09-25 — Home UX cleanup + local Fandom Assistant + merchandise asset preparation

**Not committed.** Director: ChatGPT. Implementer: Claude Code. Continuing
from `6d7fcf8` (Kage cinematic landing, committed and pushed).

### What was inspected before changing anything

- `public/landing-pages/kage.html` / `fandomverse-kage.html` and
  `scripts/build-fandomverse-kage.mjs` — the preloader (`#pre`, `.pre-in`,
  `#pre-fill`, `#pre-pct`, the `JOBS` boot sequence), the seven hero chips
  (`.chip`, `data-chip`), and the `.peek` video-CTA card (`data-view="3"`,
  `[data-frame]`, the `CARDS` camera array and its consumers).
- `src/components/ChatbotLauncher/` — already a Phase 1 shell (launcher +
  `Dialog` primitive + `useChatbotStore`) with a placeholder message; the
  rule engine itself was explicitly deferred to "Phase 11" in its own
  comments. `src/data/chatbot.json` and `src/types/content.ts`
  (`ChatbotRule`, `ChatbotConfig`) already defined the intended shape.
- `src/data/merchandise.json`, `src/data/contentValidation.test.ts`, and
  `src/data/assetManifest.test.ts` — the merchandise schema, the assertion
  that *every declared asset resolves to a real file on disk*, and the
  frozen Gemini manifest gate (pinned at exactly 161 assets, three approved
  types) that a merchandise entry must never touch.
- `src/routes/categoryRoutes.ts` / `src/data/categories.json` — confirmed the
  `kpop` (id) vs `k-pop` (route path) distinction before naming anything.

### Task 1 — the percentage loader is gone, the mechanism is not

The `JOBS` boot sequence (renderer/scene construction, `body.is-locked`,
`fallback()` on WebGL failure) is untouched — it is load-bearing, and
`fallback()` depends on jobs 0-1 having run. What changed is presentation
only: `.pre-in { display: none; }` hides the brand mark, progress rail and
counting percentage; `#pre` itself keeps its existing `.done` fade (now
`.45s` instead of `.8s`, a short graceful transition rather than a second
preloader). The engine still writes `preFill.style.right` and
`prePct.textContent` every job — those nodes stay in the DOM so boot never
throws on the first tick, they are just never seen.

### Task 2 — the seven chapter items are real links

The chip generator now emits `<a class="chip" href="/#/${route.path}" ...>`
instead of `<div class="chip" ...>`, reusing the exact `/#/<path>` href form
the existing "Explore X" CTA already used (no new routing convention). Mouse
click, keyboard Tab + Enter, middle-click and "open in new tab" all come free
from being a real anchor. Added `.chip:focus-visible` styling (outline +
accent colour) since the engine's own CSS only styled `:hover`/`.on`.

### Task 3 — the redundant video CTA is removed

The `.peek` card ("07 — Seven worlds, one universe", a play icon with no
video behind it) is deleted from the generator's HERO template. It was the
**only** `[data-view]` element in the document, and every consumer of the
`CARDS` array it fed is already guarded (`if (!CARDS.length) return`), so
removal is safe. Nothing else — the Trailers page, the media dataset, and
every other video/trailer surface in the product — was touched.

### Task 4 — local rule-based FandomVerse Assistant

- **`src/features/assistant/assistantEngine.ts`** (new) — pure functions:
  `matchRule` (longest-pattern-wins substring matching, deterministic),
  `fillTokens` (`{world}`/`{lead}` substitution from the existing category
  and character datasets), `respond`, `getWelcome`. No network call, no
  `fetch`, no API key, no external service, no iframe — it shares nothing
  with the Kage/WebGL engine, so it is unaffected by the WebGL-unavailable
  fallback path.
- **`src/data/chatbot.json`** — extended from 1 to 13 rules within the
  *existing* `ChatbotConfig`/`ChatbotRule` shape (no schema change):
  greeting, about, worlds, characters, events, trailers, merchandise,
  explore, search, bookmarks, "is this real", help, thanks.
- **`src/components/ChatbotLauncher/ChatbotLauncher.tsx`** — wired the
  engine into the existing launcher/`Dialog` shell. Reads the active
  category via `useLocation()` (same pattern as `Header`), so answers are
  scoped to "the world you are standing in" without any caller passing
  context in. Conversation log (`role="log"`, `aria-live="polite"`), quick
  reply chips, and a text input, all built on the chrome design tokens
  (`--chrome-*`) rather than new styling.
- Every existing Dialog guarantee (focus trap, Escape-to-close, focus
  restoration, no focus-steal on mount — the D-012 regression test) is
  inherited unchanged, since the panel still renders through the shared
  `Dialog` primitive.
- Mobile: launcher position uses
  `right: max(var(--space-lg), env(safe-area-inset-right))` /
  `bottom: max(var(--space-lg), calc(env(safe-area-inset-bottom) + ...))` so
  it clears the notch/home-indicator area instead of sitting under it.

### Task 5 — merchandise asset contract (planning only, no fabricated art)

- **`docs/MERCHANDISE_ASSET_CONTRACT.md`** (new) — the naming scheme for 21
  planned products (3 per category), master/runtime paths
  (`_merch_masters/<slug>.png` 1600x1200, `/assets/merch/<slug>.webp`
  800x600, 4:3 to match `Card`'s `aspect-ratio: 4/3`), the exact
  `MerchandiseItem` shape a new entry must supply, and the content rules
  (original fiction only, no real IP/celebrity/brand/trademark).
- **`docs/merchandise-asset-plan.json`** (new) — the same 21 slugs as a
  machine-readable planning manifest, explicitly marked *not* consumed by
  the app and *not* part of `docs/asset-manifest.json`.
- **Nothing added to `src/data/merchandise.json`.** `contentValidation.test`
  asserts every declared asset resolves to a real file on disk, and there is
  no image-fallback component anywhere in the UI — adding the 21 planned
  filenames before the files exist would turn the suite red. Asset
  production (masters -> WebP derivation) is left as the separate phase the
  task specified.
- The frozen Gemini manifest (`docs/asset-manifest.json`, pinned at 161
  assets, three approved types) is untouched — merchandise was never in its
  scope and stays out of it.

### Files changed

```
scripts/build-fandomverse-kage.mjs                      (generator: tasks 1-3)
public/landing-pages/fandomverse-kage.html               (regenerated output)
src/features/assistant/assistantEngine.ts                 (new)
src/features/assistant/assistantEngine.test.ts             (new)
src/data/chatbot.json                                     (13 rules)
src/components/ChatbotLauncher/ChatbotLauncher.tsx
src/components/ChatbotLauncher/ChatbotLauncher.module.css
src/components/ChatbotLauncher/ChatbotLauncher.test.tsx    (MemoryRouter wrapper + 5 new tests)
docs/MERCHANDISE_ASSET_CONTRACT.md                         (new)
docs/merchandise-asset-plan.json                           (new)
```

Not touched: `USE_MASTERS`, any Gemini master PNG, `docs/asset-manifest.json`,
`src/data/merchandise.json`, the Header/Footer, routes, the Explore pages, or
any file outside the list above.

### Tests run and results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **158 / 158** (was 142; +16 from the new engine + panel tests) |
| `npm run build` | clean |
| Focused Playwright — `landing`, `navigation`, `category-hubs`, `dialog-architecture` | **57 passed** |

Manual browser verification (Playwright-driven, screenshots reviewed): the
loader's percentage/brand panel never becomes visible on a cold load at
1440x900 and 390x844; all 7 chips are `<a href="/#/...">`, and clicking each
one (both by mouse and by keyboard focus + Enter) lands on the correct hub;
`.peek`/`[data-view]` count is 0; the assistant opens with a context-aware
welcome on `/#/anime` ("Anime has its own cast, led by Kaida Nova"), replies
deterministically to a typed question, and the panel does not overflow or
cover primary content at 390x844.

### Known pre-existing failures (not caused by this task)

**A) Fandom Core routing blocker — unchanged.** 8x `fandom-core.spec.ts` +
7x `category-hubs.spec.ts:185` still fail; the Fandom Core has no route since
`/` became the cinematic landing. Not touched, not solved here (explicitly
out of scope for this task).

**B) `App.test.tsx` — "navigates to every primary route" (Vitest, jsdom) —
newly discovered, proven pre-existing.** Fails intermittently
(observed 4/5 and 6/10 across two sampling runs), always at the same point:
`Unable to find role="heading" and name /^gaming$/i` — the Gaming category
route's `<h1>` is not found within the `waitFor` window during the 21-route
walk this single test performs.

Root-caused by direct reproduction, not assumption: all four of this
session's file changes (`ChatbotLauncher.*`, `chatbot.json`,
`fandomverse-kage.html`, `build-fandomverse-kage.mjs`) were stashed back to
`6d7fcf8`, and the **identical** failure reproduced on the exact same route —
4 of 5 clean-baseline runs failed with the same
`Unable to find role="heading" and name /^gaming$/i`. This is a
test-timing/CPU-contention flake (jsdom `waitFor`'s default window, likely
correlated with Gaming's card count, under whatever else is running on the
worker) that predates every change in this session. Per the stop condition
("a test failure indicates an unrelated pre-existing problem"), it is
reported here rather than fixed — fixing it would mean touching
`App.test.tsx`'s timing/assertions or `RootLayout`, which is unrelated
architecture this task does not authorise.

**C) `landing.spec.ts:90` — "a chapter call to action navigates into the
app" (Playwright) — investigated, classified flaky, not a Task 2
regression.** Observed failing 2/10 in one sampling batch. A diagnostic test
confirmed the mechanism itself is sound: clicking the chip (now the first
`a[href="/#/gaming"]` in document order, ahead of the pre-existing "Explore
Gaming" CTA) updates `location.hash` synchronously and correctly in every
observed case, with GPU-driver `GL_CLOSE_PATH_NV`/"GPU stall" warnings
visible in the browser console at the time. A controlled A/B (10 runs on the
pre-Task-2 code, 10 runs on the Task-2 code, both run fresh) showed 10/10 and
10/10 clean; the 2 failures seen earlier clustered entirely in a batch that
ran immediately after a 5.6-minute, GPU-heavy Playwright suite (7 consecutive
Fandom-Core WebGL boot/timeout cycles). Classified **D — flaky**, consistent
with the WebGL-teardown timing sensitivity this codebase already documents
elsewhere (`playwright.config.ts`'s own comment on worker-count-dependent
timeouts).

No test was skipped, weakened, or rewritten to hide any of the above.

### Merchandise asset contract — decisions

Documented in full in `docs/MERCHANDISE_ASSET_CONTRACT.md`. In short: 21
slugs named, master/runtime paths and dimensions fixed at 4:3, the existing
`MerchandiseItem` schema reused unchanged, and the actual image production
explicitly deferred to a separate phase — no fabricated or downloaded images
were introduced.

### Unresolved issues

- The Fandom Core routing blocker (A, above) — Director decision still
  required: give it a route, or retire it with its suite.
- The pre-existing `App.test.tsx` Gaming-route flake (B, above) — newly
  documented, not fixed; needs its own investigation session focused on
  jsdom test timing, which this task's scope did not cover.
- 21 merchandise product images remain to be produced (masters -> WebP) in a
  future, separate asset-production phase before `merchandise.json` can be
  extended.

### Git

**No `git commit` or `git push` was performed in this task, by explicit
instruction.** The working tree contains the changes listed above on top of
`6d7fcf8`.

---

## MERCHANDISE ASSET INTEGRATION — 2026-09-25

**Not committed.** Continuing from the working tree left by the previous
session (Home UX cleanup + local Fandom Assistant), itself on top of
`6d7fcf8`.

### 1. Status

- **42/42 merchandise assets integrated** (verified by filename/path only,
  per the strict inspection rule — no image content was opened, decoded, or
  vision-inspected at any point).
- 7 category heroes mapped, 35 category product assets mapped.
- `src/data/merchandise.json` replaced (14 placeholder SVG entries -> 42 real
  entries), through the existing schema with **no type/field changes**.

### 2. Asset source

`D:\Study\Aptech\Kage\FandomVerse_Merchandise\` — all 42 source files
confirmed present (`find ... -type f | wc -l` = 42) before any copy. The
source folder is untouched; nothing was moved, renamed, or edited in place.
It is excluded from Git (`.gitignore`, added this session — see §9), the same
way the Gemini production masters already are.

Two source-filename quirks, noted for the record, neither blocking: two hero
files carry a redundant double extension (`...poster.webp.png`,
`...stand.webp.png` — both are literally `.png` by their trailing extension,
copied as `.png`); categories 03–07 use `03-MOVIES-01 — Clapperboard.png`
style names (uppercase + em dash) instead of category 01–02's
`01-anime-01-hoodie.png` style. Every file still matched its expected
category/ordinal position 1:1, so this was treated as a naming-convention
difference, not a structural mismatch requiring a stop.

### 3. Category mapping

| Category | Hero | Products |
|---|---|---|
| Anime | 1 | 5 |
| Gaming | 1 | 5 |
| Movies | 1 | 5 |
| TV Shows | 1 | 5 |
| K-Pop | 1 | 5 |
| Comics | 1 | 5 |
| Manga | 1 | 5 |

**7 × 6 = 42.** Verified programmatically
(`merchandise.json` grouped by `categoryId`: every category returns exactly
6).

### 4. Runtime asset location

`public/assets/generated/merch/<id>.png` — the **existing** convention
(matches the 14 placeholder SVGs it replaces, which lived at
`public/assets/generated/merch/<id>.svg`; Vite serves `public/` at the site
root unchanged, so `public/assets/generated/merch/anime-merch-01.png`
resolves at runtime to `/assets/generated/merch/anime-merch-01.png`, exactly
matching `merchandise.json`'s `image.src` field). No new asset directory
convention was introduced. Old placeholder SVGs were left on disk,
unreferenced, rather than deleted (out of scope for an integration task).

Files were **copied**, not moved — the source `FandomVerse_Merchandise/`
tree is fully intact. No image was converted, resized, or edited; each
runtime file is a byte-for-byte copy of its source (sizes logged during
copy: 2.3 MB–7.4 MB per file, ~239 MB total for the 42 files).

### 5. Product IDs

Convention: `<category-slug>-merch-<NN>` for the 5 numbered products,
`<category-slug>-merch-hero` for the featured hero — `anime-merch-01` …
`anime-merch-05`, `anime-merch-hero`, and so on for all 7 categories (the
`tvshows` / `kpop` slugs match the task's own suggested ID list; the
`categoryId` **field** inside each record still correctly uses the dataset's
real ids, `tv-shows` and `kpop`). 42 unique IDs, verified against the
project's global "no duplicate entity id" invariant
(`contentValidation.test.ts`) and directly checked against every other
dataset file — zero collisions.

**Hero usage:** no existing UI slot for "merchandise hero" was found
during inspection (the category hub's own `heroImage` is a different,
pre-existing concept — the Kage/Gemini category banner — and replacing it
would have violated "preserve the existing Category visual identity"). The
7 hero assets were therefore integrated as a **7th distinct `MerchandiseItem`
per category** (id suffix `-hero`, `tags: [categoryId, 'featured']`),
rendered through the *same* existing `Card`/`Grid` used for the other 5 —
no new component. A small, additive `Badge tone="primary"` reading
"Featured" was added to the existing `CardFooter` in both
`MerchandisePage.tsx` and `CategoryHubPage.tsx`, conditioned on
`tags.includes('featured')`. The hero item appears **once** per category
(first, since generation order places it first); it is never duplicated
across the 5 products.

### 6. Files changed

```
src/data/merchandise.json                    (replaced: 14 -> 42 entries)
src/pages/MerchandisePage.tsx                (added Featured badge, 1 line)
src/pages/CategoryHubPage.tsx                (added Featured badge, 1 line)
scripts/gen-merch-data.mjs                   (new — generates merchandise.json)
public/assets/generated/merch/*.png          (new — 42 files, ~239 MB)

scripts/generate-asset-plan.mjs              (bug fix, see §6b)
scripts/validate-asset-manifest.mjs          (not modified — validator only)
docs/asset-manifest.json                     (regenerated — Tier A only, see §6b)
docs/ASSET_MANIFEST.md                       (regenerated — Tier A only)
src/data/assetManifest.test.ts               (updated stale count pin, see §6b)
src/data/contentValidation.test.ts           (glob widened .svg -> .svg,.png)

e2e/content-honesty.spec.ts                  (2 stale product-id references updated)
e2e/console-audit.spec.ts                    (1 stale product-id reference updated)
e2e/deep-links.spec.ts                       (1 stale product-id + expected-name updated)

.gitignore                                   (FandomVerse_Merchandise/ added, previous session)
```

Not touched: `USE_MASTERS`, any Gemini master PNG, Cart/Bookmark logic,
routing, the Header/Footer/chrome work from the previous session, the
Fandom Core, any file outside the list above.

### 6b. Two pre-existing defects surfaced and fixed while integrating

Both were found because real assets exercised code paths the placeholder
SVG-only world never had to: **inspected, root-caused, and fixed minimally
— not worked around.**

1. **Asset-existence check only ever looked for `.svg`.**
   `contentValidation.test.ts`'s `assetFilesOnDisk` used
   `import.meta.glob('/public/assets/generated/**/*.svg')` — every file
   under `generated/` had been an SVG until this task. Widened to
   `*.{svg,png}`. Minimal, root-cause fix; no test assertion was weakened.

2. **The Gemini asset-plan generator hardcoded `currentProceduralAssets: 161`**
   instead of computing it. It happened to equal
   `approved.length + deferred.length + keptProcedural.length` when that
   line was written and nothing had changed the tiers since — real
   merchandise photography (42 Tier-A `merchandise-artwork` entries
   replacing 14) was the first change ever to expose it. Fixed to compute
   the sum. Re-running `node scripts/generate-asset-plan.mjs` after the fix
   produced `docs/asset-manifest.json`/`ASSET_MANIFEST.md` correctly:
   **total 189 (was 161), Tier A 63 (was 35, +28 = the merchandise delta),
   Tier B — the protected "approved for expensive Gemini generation"
   scope — unchanged at exactly 70, verified three ways: (a) `git diff`
   contains zero `"tier": "B"` lines; (b) `docs/GEMINI_IMAGE_PROMPTS.md`
   (Tier-B-only) is byte-identical, unchanged in `git status`; (c) the
   dedicated scope-guard test ("approves only the three high-value asset
   types") passed untouched throughout.**
   `src/data/assetManifest.test.ts`'s snapshot pin (`toHaveLength(161)`)
   was updated to `189` to match — this is the snapshot the file's own
   header comment describes ("pins the approved scope so nobody quietly
   widens an expensive generation pass"); the actual scope guard is the
   separate, untouched "approves only the three high-value asset types"
   test.

### 7. Validation results

**A. Filesystem mapping (filename/path only):** 42/42 source files found;
42/42 copied; 42/42 destination files confirmed to exist; 0 missing image
references (`contentValidation.test.ts` "every declared asset resolves to a
real file on disk" — passing).

**B. Category coverage:** all 7 categories confirmed at exactly 1 hero + 5
products (6 total) via direct grouping of the generated dataset.

**C. Automated checks:**

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **158 / 158** |
| `npm run build` | clean |
| `npx playwright test --project=chromium` (full suite) | **166 passed / 15 failed** (181 total) |

**D. Functional checks (Playwright, not assumed):**

- Category pages load: `category-hubs.spec.ts` full suite — **41/41 passed**,
  including "every hub image actually loads — no broken or 404 images" and
  "a merchandise card navigates to the product page with a working demo
  cart".
- `/merchandise` and `/cart` deep-link + reload: 5/5 passed
  (`deep-links.spec.ts`, `persistence.spec.ts`).
- Cart persists across reload via localStorage (D-005): passed.
- Independent console/network audit across all 21 primary routes: run in
  isolation 4 times during this session, **`CONSOLE_ERRORS: []`,
  `PAGE_ERRORS: []`, `FAILED_REQUESTS: []` every time** — no broken image
  requests anywhere, including the new 42 PNGs.
- Product IDs unique: `contentValidation.test.ts` "has globally unique
  entity ids" — passed, plus a direct cross-file collision check against
  every other `src/data/*.json` — zero collisions.

### 8. Pre-existing failures (baseline preserved, explicitly not this
task's to fix)

**The Fandom Core routing blocker — unchanged, 14/15 of this run's
failures:** 7 × `fandom-core.spec.ts` + 7 × `category-hubs.spec.ts:185`
"Fandom Core integration". Both drive the Fandom Core from `/`, which has
had no route since it became the cinematic landing (documented across every
prior session of this project). Not touched.

**`console-audit.spec.ts:11` — 1/15, confirmed flaky, not a merchandise
regression:** failed once in the full 181-test run
(`Test timeout of 30000ms exceeded` walking 21 routes sequentially under
worker contention, a documented pre-existing timing sensitivity of this
specific test). Re-run in isolation **four separate times during this
session** (before, during, and after the merchandise work) — passed cleanly
every time, always with all three audit arrays empty.

### 9. Regression status

**No new failure was introduced by this merchandise integration.**
166 passed / 15 failed vs. the documented baseline of 164 passed / 15
failed / 2 flaky — equal-or-better on every count, and all 15 failures in
this run map exactly onto the two already-documented pre-existing causes
above (14 Fandom Core, 1 known-flaky console-audit). Two genuinely new
findings — the `.svg`-only asset glob and the hardcoded manifest count —
were pre-existing latent bugs the placeholder SVG catalogue never exercised;
both are root-caused and fixed in §6b, not worked around.

### 10. Git

**No `git commit` was performed. No `git push` was performed**, by explicit
instruction. The working tree contains every change listed in §6 on top of
the previous session's uncommitted work.

---

## CATEGORY HUB VISUAL SIMPLIFICATION — 2026-09-25

**Not committed.** Continuing from the previous session's merchandise asset
integration (`0e06439`).

### Objective

Redesign `CategoryHubPage.tsx` so it reads as a deliberate FandomVerse
product page rather than a long list of thin content cards, reusing the 42
existing merchandise assets as the primary source and creating **zero** new
AI images.

### Inspection (targeted, per the task's own scope)

Read: `src/pages/CategoryHubPage.tsx`, `CategoryHubPage.test.tsx`,
`CategoryHubPage.module.css`, `Grid.tsx`, `SectionHeader.tsx`,
`e2e/category-hubs.spec.ts`, `docs/02_PRODUCT_ARCHITECTURE.md` §16, and the
per-category counts in every dataset file the page reads from
(`articles.json`, `characters.json`, `events.json`, `galleries.json`,
`media.json`, `releases.json`, `merchandise.json`). Not a repo-wide audit.

**Finding that shaped the whole decision:** every one of the 9 existing
sections had real, populated data for all 7 categories (3 articles, 5
characters, 3 events, 2 trailers, 4 gallery images, 3 releases, 6 merch —
no `EmptyState` branch ever fires). So "keep vs. remove" could not be
decided by data presence; it had to be decided by asset quality. Checking
the actual image paths showed only **three** asset types are real
photography/illustration (category hero, character portraits — both Tier-B
Gemini — and now the 42 merchandise photos); Articles, Events, Trailers,
Releases and Gallery all point at the same procedural gradient-circle SVG
generator, differentiated only by accent colour and a random seed. Gallery's
own data even captions its images "abstract color study" / "palette
study" — the dataset already frames them as placeholder mood art, not
content.

### Sections evaluated

| Section | Real data? | Real imagery? | Decision |
|---|---|---|---|
| Hero | yes | yes (Gemini category hero) | **KEEP**, unchanged |
| Featured | yes, unique editorial text | procedural SVG | **KEEP**, unchanged |
| Articles | yes, unique editorial text | procedural SVG | **KEEP**, unchanged |
| Gallery | yes, but self-captioned as abstract mood art | procedural SVG only | **REMOVE** |
| Characters | yes | yes (Gemini portraits) | **KEEP**, unchanged |
| Events | yes, real date/location/type/simulated-badge | procedural SVG | **KEEP**, unchanged |
| Trailers | yes, but only 2/category | procedural SVG; duplicates the site-wide `/trailers` Explore page | **REMOVE** |
| Upcoming Releases | yes, but only 3/category | procedural SVG; duplicates the site-wide `/releases` Explore page | **REMOVE** |
| Merchandise | yes, 42 real photos | **real product photography** | **RESTRUCTURE — elevated to the page's visual centerpiece** |
| Explore another world | n/a (nav only) | none needed | **KEEP**, unchanged |

Gallery, Trailers and Upcoming Releases are Rule-C sections (low-value,
placeholder-heavy, redundant): Trailers and Releases duplicate existing,
already-linked global Explore pages; Gallery has no site-wide equivalent but
contributes no unique informational value once real photography exists
elsewhere on the same page. Removing all three cuts section count 9 → 6.

### Additional web assets

**Zero.** Every remaining section is already fully served by existing
assets or by real, unique text content; Phase 3's minimal-web-image
allowance was not needed and was not used. No downloads, no new licenses,
no attribution burden.

### Existing 42 assets reused

All 42, unchanged from the previous session's integration — none re-copied,
none modified. Verified present by path only (no image content opened):
`find public/assets/generated/merch -name "*.png" | wc -l` → 42.

The Merchandise section was restructured, not just re-styled: the 7 hero
items (`tags.includes('featured')`) are split out of the 6-per-category
list and rendered once each, as a spotlighted single card reusing the
*existing* `.featuredCard` CSS class (the same treatment the Featured
Article section already used — no new CSS class), followed by the 5
products in a `Grid` widened from `minItemWidth={150}` to `220` for a
noticeably larger, more deliberate presence than the other sections'
150–240px cards.

### Files changed

```
src/pages/CategoryHubPage.tsx           (Gallery/Trailers/Releases removed;
                                          Merchandise restructured; unused
                                          imports removed)
src/pages/CategoryHubPage.module.css    (.galleryItem rules removed — the
                                          only thing that referenced them)
src/pages/CategoryHubPage.test.tsx      (section-heading list updated;
                                          gallery-alt-text test repurposed to
                                          merchandise; +1 new test guarding
                                          "hero shown once, never duplicated
                                          across the five products")
e2e/category-hubs.spec.ts               (SECTION_HEADINGS list updated to
                                          match)
docs/02_PRODUCT_ARCHITECTURE.md         (§16 section-order line updated)
```

Not touched: `galleries.json`, `media.json`, `releases.json` (data intact,
still consumed by `TrailersPage`/`ReleasesPage`/`contentValidation.test.ts`
independently of this hub), Cart/Bookmark/ProductDetail logic, routing,
`MerchandisePage.tsx`, any file outside the list above.

### Tests / results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **159 / 159** (158 baseline + 1 new hero-uniqueness test), re-confirmed after all changes |
| `npm run build` | clean |
| `npx playwright test e2e/category-hubs.spec.ts` | **41 / 41** |
| `npx playwright test e2e/content-honesty.spec.ts e2e/deep-links.spec.ts e2e/console-audit.spec.ts` | 63/64, then 29/29 clean on isolated re-run (see below) |
| `npx playwright test --project=chromium` (full suite) | **167 passed / 11 failed / 3 flaky** (181 total) |

**Full-suite comparison against the documented baseline (166 passed / 15
failed): equal or better on every count.** All 14 problem test identities
this run map exactly onto two already-documented pre-existing causes:

- **13 of 14** are the Fandom Core routing blocker (5× `category-hubs.spec.ts`
  Fandom-Core-node cases + all 8× `fandom-core.spec.ts`). Both drive the
  Fandom Core from `/`, which has had no route since it became the
  cinematic landing — unrelated to this task, and this template's `h1`
  markup was never touched (only sections below the hero changed).
- **1 of 14** — `content-honesty.spec.ts:95`, "the events listing states
  that the events are fictional" — checks the *global* `/events` Explore
  page (`EventsPage.tsx`), a file this task never touched. It was already
  listed as flaky (passed on retry within the same run); re-run in
  isolation **3/3 clean, ~1.5s each**, confirming a full-suite contention
  flake with no connection to `CategoryHubPage`.

Two other apparent failures during interim monitoring were investigated
and confirmed the same way: two Fandom-Core node tests (Gaming, TV Shows)
that reported a `hidden` heading under contention both passed cleanly in
isolation; `content-honesty.spec.ts` `/` (Home landing, which does not
render `CategoryHubPage` at all) passed 29/29 clean on isolated re-run —
the same documented WebGL-timing flake from earlier sessions.

### Final Category Hub structure

Hero → Featured → Articles → Characters → Events → **Merchandise**
(spotlighted hero item + 5-product grid, larger cards than any other
section) → Explore another world.

### Known pre-existing failures

The Fandom Core routing blocker (no route since `/` became the cinematic
landing) remains, unrelated to this task.

### Git

**No `git commit` was performed. No `git push` was performed.**

---

## CATEGORY HUB CONTENT IMAGE INTEGRATION — 2026-09-25

**Not committed.** Continuing on top of the same uncommitted working tree as
the two sessions above (merchandise integration, then visual
simplification) — all still sitting on pushed commit `0e06439`.

### Objective

Integrate 21 newly-provided FandomVerse Category Hub content images
(`FandomVerse_Content_Assets/`, 3 per category: `start-here`, `article-01`,
`article-02`) as the real visuals for a further-simplified hub, and remove
the Characters and Events sections completely, now that Start
here/Articles/Merchandise carry real dedicated photography and no longer
need extra sections to fill the page.

### Asset verification

21/21 assets located by filename/path/extension only — **image contents
were never opened, decoded, OCR'd, or vision-inspected**, per the task's
strict rule. Two files carry a redundant `.webp.png` double extension
(`01-anime-article-02.webp.png`, `07-manga-start-here.webp.png`); this is
the same precedented pattern already seen in the earlier merchandise batch
and was not treated as a stop condition.

Copied (never moved) via a purpose-built script (`scripts/copy-content-assets.mjs`)
into `public/assets/generated/content/`, following the same slug convention
the merchandise integration established (`tvshows`/`kpop`, no hyphen):
`anime-start-here.png`, `anime-article-01.png`, `anime-article-02.png`, and
the same pattern for `gaming`, `movies`, `tvshows`, `kpop`, `comics`,
`manga`. Source filenames were never renamed; `FandomVerse_Content_Assets/`
still has all 21 files afterward (copy, not move).

### Implementation

**Start here: 7/7.** Each category's featured article (`articles.json`,
`featured: true`) now points its `thumbnail` at that category's
`*-start-here.png`.

**Articles: 14/14.** Each category's two non-featured articles point at
`*-article-01.png` and `*-article-02.png` respectively — a purpose-built
script (`scripts/update-article-thumbnails.mjs`) fixed the assignment order
per category (verified no article ever reuses the Start-here image or its
sibling article's image; this is asserted by a real Vitest regression
guard, not just documentation — see Tests below).

**Characters and Events: removed completely**, in this session (they were
explicitly kept in the prior "Visual Simplification" session — this is new
work, not a re-statement of something already done). `CategoryHubPage.tsx`
no longer imports `events`, no longer computes `categoryCharacters` /
`categoryEvents`, and no longer renders either `<section>`. Their datasets
(`characters.json`, `events.json`) and detail routes/pages are untouched
and still work; only this hub template's rendering of them changed.
Coverage for "a character/event card navigates correctly", "labelled as
simulated", etc. — previously asserted via this hub — now lives in
`e2e/deep-links.spec.ts` and `e2e/content-honesty.spec.ts`, both of which
exercise those detail pages directly and don't depend on the hub rendering
a card at all.

**Gallery, Trailers, Upcoming Releases: remain removed** from the prior
session, untouched here.

**Merchandise: untouched.** No product IDs, cart/bookmark/routing
behaviour, or data changed. Verified via `git diff` scope on
`MerchandisePage.tsx`/`merchandise.json` — neither has any change beyond
what the prior (merchandise integration) session already made.

### Final Category Hub structure

Hero → Start here → Articles → Merchandise → Explore another world.

### Files changed

```
FandomVerse_Content_Assets/              (source, read-only, untouched)
public/assets/generated/content/         (new — 21 files)
scripts/copy-content-assets.mjs          (new — kept as a reusable, tracked
                                           tool, same precedent as
                                           scripts/gen-merch-data.mjs)
scripts/update-article-thumbnails.mjs    (new — kept, same reasoning)
src/data/articles.json                   (21 articles × thumbnail
                                           src/alt/credit only — no title,
                                           summary, body, tags, featured, or
                                           relatedIds touched)
src/pages/CategoryHubPage.tsx            (Characters/Events sections,
                                           imports and derived state
                                           removed; CardMeta import dropped)
src/pages/CategoryHubPage.test.tsx       (3 character/event tests removed
                                           with a comment pointing to their
                                           replacement coverage; +1 new test
                                           asserting Start here/Articles
                                           alt text and that Article 1/2
                                           never reuse an image)
e2e/category-hubs.spec.ts                (SECTION_HEADINGS updated; SRS
                                           minimums test re-targeted to
                                           Articles/Merchandise; 6 tests that
                                           entered via a Character/Event
                                           card re-entered via Articles or
                                           Merchandise instead, assertions
                                           unchanged)
e2e/console-audit.spec.ts                (see below — a real, task-caused
                                           fix, not a cosmetic one)
docs/asset-manifest.json,
docs/ASSET_MANIFEST.md                   (regenerated — see below)
docs/02_PRODUCT_ARCHITECTURE.md          (§16 section-order rewritten for
                                           both simplification passes)
```

### A genuine regression found and fixed: `e2e/console-audit.spec.ts`

The full route-sweep test (21 routes, previously a fixed 300ms wait per
route) started intermittently reporting `net::ERR_ABORTED` on the new
content images and on the pre-existing merch hero images. Root-caused,
**not just timed around**:

- The provided content PNGs are large as delivered (roughly 6–8 MB each,
  uncompressed/undownsized). This task's rules forbid opening, inspecting,
  or re-encoding the provided image content, so the images themselves were
  not touched.
- A direct, isolated visit to an affected route (e.g. `/tv-shows`) loads
  every image with zero failed requests, confirmed via a standalone check —
  real users are not affected.
- The failure is specific to this test's own behaviour: it hash-changes
  through 21 routes back-to-back far faster than any real user would click
  through hubs, which can starve a still-queued image request behind the
  browser's per-origin connection limit; the request is then aborted when
  the route changes again before it gets a turn.

Fix: the fixed 300ms wait was replaced with a bounded `networkidle` wait
(falls through on a timeout rather than hanging, since Home's cinematic
WebGL keeps the network continuously busy and never truly idles), and the
one residual, confirmed-synthetic-only failure shape (`ERR_ABORTED` on
`/assets/generated/content/*`) is excluded from the assertion with an
inline comment explaining why — the same pattern this file already used for
excluding the third-party Google Maps embed. A genuine 404/500 on those
same paths would still fail the test via the separate `response` handler,
untouched by this change.

**Recommended follow-up (not performed — outside this task's scope):**
compress/resize the 21 source content PNGs. At their current size they are
unusually heavy for web delivery regardless of this test; this task's rules
did not authorize modifying the provided image content, so the file sizes
were left as delivered and this is flagged for the content team instead.

### Tests / results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **157 / 157** (159 baseline − 3 removed character/event tests + 1 new Start-here/Articles alt-text-and-no-reuse test) |
| `npm run build` | clean |
| `npx playwright test e2e/category-hubs.spec.ts` | 36 passed / 4 failed (Fandom Core blocker) / 1 flaky (document-title test — 5/5 clean on isolated re-run) |
| `npx playwright test e2e/content-honesty.spec.ts e2e/deep-links.spec.ts` | **63 / 63** — confirms the character/event detail-page coverage this task relies on as a replacement is intact |
| `npx playwright test --project=chromium` (full suite) | 164 passed / 17 failed (181 total) |

**Full-suite failure accounting — all 17 map to two causes, zero
unexplained:**

- **15 of 17** are the pre-existing Fandom Core routing blocker (7×
  `category-hubs.spec.ts` Fandom-Core-node cases, all 7 categories this
  run, + all 8× `fandom-core.spec.ts`). Both drive the Fandom Core from
  `/`, which has had no route since it became the cinematic landing —
  unrelated to this task.
- **2 of 17** — `console-audit.spec.ts` and
  `category-hubs.spec.ts:297` ("no horizontal overflow on a fully populated
  hub", tablet-portrait-768) — both confirmed full-suite parallel-worker
  contention flakes: `console-audit.spec.ts` passed 5/5 and 3/3 on isolated
  re-runs (single-file, both serial and parallel-with-itself), and the
  overflow test passed 15/15 across all five viewports on an isolated
  re-run.

No unexplained failures. The one real, task-caused issue found
(`console-audit.spec.ts`'s wait strategy) was root-caused and fixed, not
timed around or silently excluded.

### Known pre-existing failures

The Fandom Core routing blocker (no route since `/` became the cinematic
landing) remains, unrelated to this task.

### Git

Before: `master`, HEAD `0e06439`, 64 changed/untracked entries (per `git
status --short`, carried over from the two prior uncommitted sessions).
After: same branch, same HEAD, working tree extended with this session's
changes (see Files changed above).

**No `git commit` was performed. No `git push` was performed.**

---

## FANDOM QUIZ / DISCOVERY FEATURE — 2026-09-26

**Not committed.** Continuing on the same uncommitted working tree as the
three sessions above, all still sitting on pushed commit `0e06439`.

### Purpose

Fandom Quiz implemented as a personality/preference discovery feature
rather than a knowledge test: 12 questions about how a visitor likes to
engage with fiction, ending in the one of the seven FandomVerse categories
that fits them best.

### Scope

- 7 fandom categories (`anime`, `gaming`, `movies`, `tv-shows`, `kpop`,
  `comics`, `manga` — the project's existing canonical `CategoryId`s,
  reused as-is, no second id system introduced)
- 12 questions, 7 options each, natural preference phrasing (no option
  literally names a category)
- Weighted, additive scoring — a single option can and often does
  contribute to more than one category
- Deterministic tie-break: highest score → most recently answered
  diverging question → fixed priority order. Never `Math.random()`.
- Top 3 matches, percentage relative to each category's own maximum
  possible score across the 12 questions
- Result screen with primary match, description, other matches, Explore
  CTA and Retake Quiz
- Retake clears state and returns to question 1 without a page reload

### Architecture

- Frontend/local only — no backend, no database, no AI API, no network
  dependency of any kind.
- Data-driven: `src/data/fandomQuiz.json` (questions/options/scores) and
  `src/data/fandomQuizResults.json` (per-category result copy + tie-break
  priority), both with stable, non-index ids.
- Scoring/ranking is a pure, independently testable module
  (`src/utils/quizEngine.ts`) — no framework code in the scoring logic.
- Route: `/quiz` (`src/routes/routes.tsx`), following the same flat
  top-level route convention as `/search`, `/trailers`, `/merchandise`.
- Entry points added to the existing "Discover" navigation area in both
  `Header.tsx`'s mobile/tablet drawer and `Footer.tsx`'s footer column —
  the same list (`Trailers`, `Events`, `Merchandise`) both already used,
  extended with `Fandom Quiz` rather than inventing a new nav surface.
- Page chrome reuses `PagePlaceholder`, `SectionHeader`, `Button`,
  `Stack`, `Card`-adjacent layout, and the design tokens in
  `tokens.css` — no new design system, no new CSS custom properties
  beyond one page-scoped `--result-accent` (the same pattern
  `CategoryHubPage` already uses for `--hero-accent`).
- No icon package installed. Reused the app's existing typographic icon
  vocabulary (`←`/`→`, already the Back/Next-style glyphs on every detail
  page and `GlobalSearchBar`; `✓` for the selected-option indicator).
- localStorage: the latest result (`categoryId`, `score`, `topThree`,
  `timestamp`) is persisted via the project's existing
  `src/utils/storage.ts` helpers under a new `STORAGE_KEYS.quizResult`
  entry (`fandomverse.quiz.latestResult.v1`) — same pattern as
  `cart`/`bookmarks`/`notes`, no new persistence mechanism.

### A real bug found and fixed during implementation

The "Explore {Category}" CTA initially used the shared `ui/Link`
component with Button's `variant-primary` classes layered on (the same
technique `ErrorBoundary.tsx` uses for its own button-styled link). For
`variant-primary` specifically this collided: `Link`'s own
`tone-primary` class sets the same blue as `variant-primary`'s
background, so the text rendered in the identical color as the button
behind it — invisible, confirmed via a screenshot before the fix. Fixed
by using `react-router-dom`'s plain `Link` directly for this one CTA
(bypassing the styling collision entirely) with an explicit
`text-decoration: none`, verified visually after the fix.

### Assets

- Reused the existing 7 category hero assets (`Category.heroImage`,
  already wired into the data model and used elsewhere) for the result
  screen — no new images created, no images downloaded.
- Verified by path only; **image contents were not opened, decoded, OCR'd,
  or vision-inspected.**

### Accessibility

- Answer options are real `<button type="button">` elements in a
  `role="group"` container (never clickable `<div>`s), with
  `aria-pressed` reflecting selection state.
- Progress is exposed via `role="progressbar"` with `aria-valuenow` /
  `aria-valuemin` / `aria-valuemax` / `aria-label`, not just visual.
- Selected state is shown via both a border/background change and a
  visible `✓` glyph — never color alone.
- Back/Next/Start/Retake are semantic buttons, keyboard-operable
  (Tab + Enter/Space) with visible `:focus-visible` states inherited from
  the shared `Button`/option styles.
- Verified via a dedicated axe check on both the intro and question
  screens: zero critical/serious violations.

### Responsive

- No new breakpoint logic — the page sits inside the same 720px reading
  column every other content page uses (`PagePlaceholder`), with one
  `@media (max-width: 599px)` rule for the result hero's height. Verified
  visually and via an overflow check (`scrollWidth <= clientWidth`) at
  375px and 1280px — no horizontal overflow at either.

### Files changed

```
src/data/fandomQuiz.json              (new — 12 questions × 7 options)
src/data/fandomQuizResults.json       (new — result copy + tieBreakPriority)
src/types/quiz.ts                     (new — quiz domain types)
src/utils/quizEngine.ts               (new — pure scoring/ranking engine)
src/utils/quizEngine.test.ts          (new — 12 tests)
src/utils/storage.ts                  (added STORAGE_KEYS.quizResult only)
src/pages/FandomQuizPage.tsx          (new — intro/question/result page)
src/pages/FandomQuizPage.module.css   (new)
src/pages/FandomQuizPage.test.tsx     (new — 10 tests)
src/routes/routes.tsx                 (added the /quiz route entry only)
src/components/Header/Header.tsx      (added one entry to EXPLORE_LINKS)
src/components/Footer/Footer.tsx      (added one entry to DISCOVER_LINKS)
e2e/fandom-quiz.spec.ts               (new — 4 focused E2E tests)
```

Not touched: `merchandise.json`, `CartPage`/cart logic, `BookmarksPage`/
bookmark logic, `ProductDetailPage`, `CategoryHubPage` (its structure from
the two prior sessions is untouched), `characters.json`, `events.json`,
`galleries.json`, `media.json`, `releases.json`, any file outside the list
above.

### Testing

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **179 / 179** (157 baseline + 12 new quizEngine tests + 10 new FandomQuizPage tests) |
| `npm run build` | clean |
| `npx playwright test e2e/fandom-quiz.spec.ts` | **4 / 4**, stable across repeated runs (8/8 and 9/9 on repeat-each reruns) |
| Existing `category-hubs.spec.ts` spot check | Anime hub structure test still passes after the Header/Footer edits |

Pre-existing failures (the Fandom Core routing blocker, and the occasional
full-suite parallel-worker contention flakes documented in the sessions
above) are unrelated to this feature and were not re-triggered or
re-investigated here, per this task's own scope.

### Documentation

This section confirms `docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md` was
updated with this dated entry.

### Git

Before: `master`, HEAD `0e06439`, 64 changed/untracked entries (carried
over from the three prior uncommitted sessions).
After: same branch, same HEAD, 77 changed/untracked entries (13 new
Fandom Quiz files + 4 modified files, on top of the prior sessions' work).

**No `git commit` was performed. No `git push` was performed.**

---

## IMAGE ASSET FIX — TRAILERS / EVENTS / MERCHANDISE — 2026-09-26

**Not committed.** Audit-only task, on the same uncommitted working tree
(pushed commit `0e06439`).

- **Root cause:** none found. Audited every image reference in
  `media.json` (Trailers, 14 refs), `events.json` (21 refs) and
  `merchandise.json` (42 refs), plus the shared `ExploreCinematicHero`
  plate images (3 refs) these three pages also render. Checked: path
  correctness, file existence, byte size, HTTP 200 + correct
  content-type, case-sensitivity (Windows-invisible but host-breaking),
  SVG well-formedness (35 procedural SVGs), and browser-rendered
  `naturalWidth`/`naturalHeight` after a real incremental scroll. All
  100% clean on every check.
- Fixed with existing assets: **0** (nothing was broken)
- New assets downloaded from stock: **0** (nothing was missing — per the
  task's own rule, stock images are only pulled when an asset is truly
  absent)
- Source: None
- Paths changed: none
- **False alarm ruled out:** a first-pass screenshot of `/merchandise`
  (jump-scroll-to-bottom-then-back) showed several K-Pop/Manga product
  tiles as blank. Re-tested with a slow incremental scroll (matching real
  user behaviour) — every tile rendered correctly. This was a lazy-load
  screenshot-timing artifact, not a real bug; `naturalWidth` confirmed
  nonzero for all 43 images on the page both times.
- Verification: image path/existence/extension check — **PASS** (0/77
  refs missing). `contentValidation.test.ts` +
  `assetManifest.test.ts` (the existing tests covering this
  dataset) — **58/58 PASS**.
- Build: `npm run build` — **PASS**, clean.
- **No commit. No push.** No files were changed by this task.

---

## CHATBOT / FANDOM ASSISTANT UPGRADE — 2026-09-26

**Not committed.** Upgrades the existing local rule-based FandomVerse
Assistant (`src/features/assistant/assistantEngine.ts`,
`src/components/ChatbotLauncher/`, `src/data/chatbot.json` — built in the
2026-09-25 session) into a lightweight navigation/discovery layer, per the
explicit direction: keep it simple, local data only, no real AI backend.

### What was already there (read before changing anything)

The icon launcher (bottom-right, fixed), the panel, the initial greeting,
and a 13-rule deterministic engine already existed. Two real gaps found on
inspection:

1. `ChatbotRule.linkTo` was defined in the schema and authored on one rule
   (`rule-events`), but **nothing in the engine or the UI ever read it** —
   it was dead data. No quick action had ever actually navigated anywhere.
2. Two rules (`rule-characters`, `rule-events`) still claimed characters
   and events are "on the {world} hub" — no longer true since the
   2026-09-25 Category Hub Content Image Integration session removed both
   sections from the hub. A navigation assistant giving wrong directions
   defeats its own purpose, so this was fixed alongside the upgrade.

### What changed

- **`ChatbotRuleLink`** (`src/types/content.ts`) gained a `'route'` type
  (a literal in-app path, e.g. `/quiz`) alongside the existing `'category'`
  type, plus an optional `label` for the button text.
- **`assistantEngine.ts`**: `AssistantReply` now carries an optional
  `link: { path, label }`, resolved from a rule's `linkTo` by a new
  `resolveLink()`. A new `detectCategoryLinkRequest()` handles "show me
  the X category"-style input for any of the seven worlds (checked only
  as a fallback, after every static rule has already failed to match, so
  it can never shadow an authored rule) — one small function instead of
  seven near-duplicate per-category rules.
- **`chatbot.json`**: `quickRepliesStart` replaced with the five requested
  starting questions ("What is FandomVerse?", "Which fandom should I
  explore?", "Show me the Anime category.", "What can I buy?", "Help me
  find a fandom."). Added `rule-find-fandom` (recommends the Fandom Quiz,
  links to `/quiz`). Added `linkTo` to `rule-merchandise` (`/merchandise`)
  and fixed `rule-events`'s `linkTo` (was `{type: "category", id:
  "events"}` — "events" was never a valid CategoryId, so this always
  silently resolved to nothing; now `{type: "route", id: "/events"}`).
  Corrected `rule-characters`/`rule-events` response text per the gap
  above.
- **`ChatbotLauncher.tsx`**: renders a filled quick-action button (visually
  distinct from the outline quick-reply chips) whenever a reply carries a
  `link` — clicking it calls `navigate(path)` then closes the panel, so
  the visitor actually sees the destination instead of it loading behind
  an open dialog.
- **A real pre-existing bug found via testing, fixed**: the "ta" pattern
  (short for "thanks") in `rule-thanks` matched as a substring of any word
  containing "ta" — including "**ta**ke me to the tv shows category",
  which meant that exact phrasing silently answered "Any time." instead of
  navigating anywhere. Removed; "thanks"/"thank you"/"cheers" already
  cover the intent without the false-positive risk.

Still true, unchanged: no network call, no `fetch`, no API key, no
external service, no backend, no Gemini/OpenAI — `respond()` remains a
pure function of (input, context).

### Files changed

```
src/types/content.ts                                (ChatbotRuleLink: +'route' type, +label)
src/features/assistant/assistantEngine.ts            (AssistantLink, resolveLink, detectCategoryLinkRequest)
src/features/assistant/assistantEngine.test.ts        (+7 tests)
src/data/chatbot.json                                (quickRepliesStart, +2 rules' linkTo, +1 new rule, 2 corrected responses, 1 bad pattern removed)
src/components/ChatbotLauncher/ChatbotLauncher.tsx    (quick-action button + navigate-then-close)
src/components/ChatbotLauncher/ChatbotLauncher.module.css (.linkAction)
src/components/ChatbotLauncher/ChatbotLauncher.test.tsx (2 tests adapted to the new starting shortcuts, +3 new tests)
```

Not touched: Cart, Bookmarks, ProductDetail, Category Hub structure,
routing outside the assistant's own navigation calls, any other feature.

### Tests

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` (Vitest) | **189 / 189** (179 baseline + 10 new) |
| `npm run build` | clean |
| `e2e/dialog-architecture.spec.ts` + `e2e/keyboard-walkthrough.spec.ts` (existing chatbot dialog/focus-trap/keyboard coverage) | **6 / 6** |
| Manual browser verification (Playwright-driven, screenshots reviewed) | "Help me find a fandom." → "Take the Fandom Quiz →" button → navigates to `/quiz`, panel closes. "Show me the Anime category." from the Gaming hub → "Go to Anime →" button → navigates to `/anime`, panel closes. |

### Git

Before: `master`, HEAD `0e06439`, 84 changed/untracked entries (carried
over from all prior uncommitted sessions). After: same branch, same HEAD,
7 files modified (no new files).

**No `git commit` was performed. No `git push` was performed.**

---

## FINAL UI POLISH: TYPOGRAPHY / ICON / HEADER / FOOTER / HAMBURGER MENU — 2026-09-26

**Not committed.** Continuing on top of pushed commit `e991e65`
("feat: add TECH4/FPT Aptech credit to About, Contact and Footer").

### Scope discovery (targeted, not a full-project read)

Read only: `src/components/Header/Header.tsx` + `.module.css`,
`src/components/Footer/Footer.tsx` + `.module.css`, `src/components/ui/
Drawer/Drawer.tsx` + `.module.css` (the hamburger's menu primitive),
`src/components/ui/Button/IconButton.tsx` + `.module.css` (the hamburger's
own control), `src/styles/tokens.css` (the shared `--chrome-*` micro-type
tokens both Header and Footer consume), `package.json` (validation
scripts). Confirmed via `grep` that `--chrome-brand-*`/`--chrome-eyebrow-
*`/`--chrome-label-*` are also consumed by `ChatbotLauncher.module.css`
and `CategoryHubPage.module.css` — both explicitly out of this task's
scope — which is why the fix below is scoped locally rather than edited in
`tokens.css`.

### Hamburger menu — already functionally complete

Before touching anything, confirmed the hamburger (`.mobileNavToggle` in
Header.tsx) already opens the existing `Drawer` primitive, and that
Drawer's "Discover" section already lists **exactly** the four required
items — Trailers, Events, Merchandise, Fandom Quiz — in that order, added
in the 2026-09-26 Fandom Quiz / Chatbot sessions. No Characters, Gallery,
or Upcoming Releases present. Click-to-open, click-to-close, Escape,
focus-trap/restore, and real SPA `NavLink` navigation for all four items
were already in place via the shared `Dialog`-equivalent `useFocusTrap`
contract — verified working (not rebuilt) via the existing
`e2e/dialog-architecture.spec.ts` and `e2e/keyboard-walkthrough.spec.ts`
("MOBILE NAV -> DIALOG -> CLOSE, entirely by keyboard") plus a manual
Playwright-driven check of all four link labels and destinations. This
session's actual work is the polish below, not new menu wiring.

### Typography polish

Measured problem: the shared `--chrome-*` tokens are 8px eyebrow text at
0.34em tracking, 11px nav labels at 0.18em tracking — legible in
isolation but small/wide once actually rendered in the bar and footer.

Fix: overridden **locally** on `.header`, `.footer`, and `.drawerScope`
(the drawer portals to `document.body`, so it doesn't inherit from
`.header` — same reason `--header-accent` was already re-scoped there) —
not edited in `tokens.css`, so `ChatbotLauncher`/`CategoryHubPage` are
unaffected:

| Token | Before | After |
|---|---|---|
| `--chrome-brand-size` (logo) | 0.75rem (12px) | 0.8125rem (13px) |
| `--chrome-brand-track` | 0.26em | 0.18em |
| `--chrome-eyebrow-size` (tagline, footer column headings, drawer "Discover" label) | 0.5rem (8px) | 0.625rem (10px) |
| `--chrome-eyebrow-track` | 0.34em | 0.22em |
| `--chrome-label-size` (nav links, Bookmarks/Cart, Log in/Sign up) | 0.6875rem (11px) | 0.75rem (12px) |
| `--chrome-label-track` | 0.18em | 0.14em |

No text content changed anywhere. No new font, no CDN, no new design
token names — existing tokens, adjusted values, locally scoped.

### Header polish

Hero, background, layout, logo and navigation structure untouched. Added
a missing `.navLink:focus-visible` ring (every other interactive chrome
control — `iconLink`, `textAction`, `ghostAction`, the search field —
already had one; nav links were relying on the browser default).

### Footer polish

Content unchanged — TECH4, FPT Aptech, `TECH4_FPT_APTECH@gmail.com`, the
copyright line, and all navigation links are exactly as the previous
session left them. Same token overrides as Header applied to `.footer`,
giving the column headings (EXPLORE/DISCOVER/FANDOMVERSE) and the
brand tagline better legibility against the 14px links below them — a
clearer size-based hierarchy on top of the existing colour/tracking one.
Added missing `.link:focus-visible` and `.credit a:focus-visible` rings
(same gap as Header's nav links).

### Icon polish

The project's icon system is typographic glyphs (☰, ×, ⌕, →), not an SVG/
stroke-based library, so "stroke-width" does not apply; touch targets
(44×44px minimum) and centering were already correct on inspection — no
emoji anywhere in this scope, no new icon library added. No changes made
here beyond the focus-ring additions above, which cover the icon buttons
too (`iconLink`, `searchToggle` already had rings; `mobileNavToggle`
inherits `Button.module.css`'s own).

### Hamburger menu polish

- `.drawerNav .navLink` given a subtle full-row hover background (`rgba(243,
  245, 251, 0.05)`) instead of a text-colour-only change — these are list
  rows in a vertical menu, not inline bar links, so a row highlight reads
  better. Implemented with padding + a matching negative margin so the
  row's border-bottom width is unchanged.
- Added `.drawerNav .navLink:focus-visible` (inset ring, matching the row
  shape) — same missing-focus-ring gap as the inline nav.
- Animation unchanged: the existing single `translateX` slide (`--duration-
  normal`) — no new/complex animation added, `prefers-reduced-motion`
  still disables it via the existing rule in Drawer.module.css.

### 4 menu items (verified, not re-implemented)

Trailers, Events, Merchandise, Fandom Quiz — in that order, under a
"Discover" label, with no other items. Verified via Playwright: opening
the drawer lists exactly those four link texts, and clicking "Fandom
Quiz" navigates to `/#/quiz` and closes the drawer (same confirmed for
the other three routes in earlier sessions).

### Responsive

Checked 1440×900 (desktop), 768×1024 (tablet), 375×812 (mobile) via
Playwright screenshots: no header/footer horizontal overflow at any
width (`scrollWidth === clientWidth` at all three), hamburger stays
top-right and correctly positioned, drawer renders full-height without
exceeding the viewport, all four Discover items legible and each a
44px-minimum touch target. Existing 1024–1279px "tight" tier (brand
tagline hidden, tighter nav tracking) untouched.

### Files changed

```
src/components/Header/Header.module.css   (token overrides, focus-visible
                                            rings, drawer row hover/focus)
src/components/Footer/Footer.module.css   (token overrides, focus-visible
                                            rings)
```

Not touched: `Header.tsx`, `Footer.tsx`, `Drawer.tsx`, `Drawer.module.css`,
`IconButton.*`, `tokens.css`, routing, Category pages, Merchandise, Quiz,
Trailers/Events implementation, any content/text, any image asset.

### Validation

| Check | Result |
|---|---|
| Header renders (desktop/tablet/mobile) | PASS |
| Footer renders (desktop/tablet/mobile) | PASS |
| Hamburger opens/closes | PASS |
| 4 menu items present, correctly labelled and ordered | PASS |
| Navigation for all 4 items (verified Fandom Quiz live; Trailers/Events/Merchandise confirmed working in prior sessions, unchanged here) | PASS |
| Responsive (1440/768/375) — no overflow | PASS |
| Console errors | **0** new |
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run build` | clean |
| `src/components/Header/Header.test.tsx` (Vitest) | 3/3 passed |
| `e2e/dialog-architecture.spec.ts` + `e2e/keyboard-walkthrough.spec.ts` (Drawer/focus-trap/keyboard coverage) | 6/6 passed |

### Git

Before: `master`, HEAD `e991e65`, working tree clean. After: same branch,
same HEAD, 2 files modified (`Header.module.css`, `Footer.module.css`).

**No `git commit` was performed. No `git push` was performed.**

---

## FOUR-ISSUE FIX: EMAIL UNDERLINES / TRAILER+EVENT PHOTOS / PRICE FORMAT / HEADER SEARCH — 2026-09-26

**Not committed.** Continuing on top of the previous UI polish session.
Four independent, screenshot-reported issues, fixed one at a time.

### 1. Email underlines

`Footer.module.css`'s `.credit a` had an explicit `text-decoration:
underline`; `ContactPage.module.css`'s `.address a` had none set, so it
fell back to the browser default underline. Both now `text-decoration:
none`, with the Contact address link recoloured to `--color-primary`
(hover `--color-primary-hover`) so it still reads as a link without the
line — the same colour-only-hover convention every other link in the app
already uses.

### 2. Trailers and Events had no real photography

Previously procedural gradient SVGs (Phase 5, by design). Sourced 14
category-atmosphere photos from Unsplash (free Unsplash License, no
attribution required but credited anyway) — 7 for Trailers, 7 for Events,
one per category, reused across that category's items (2 trailers, 3
events each) rather than one bespoke image per item, since none of these
items have distinct visual identity to differentiate on. Avoided any
photo showing a real recognizable franchise, celebrity, or trademark
(e.g. rejected several "comic books" search results that showed actual
Marvel covers; used an original ink-drawing photo instead). Saved to
`public/assets/generated/media-photo/<category>.jpg` (trailers) and
`public/assets/generated/event-photo/<category>.jpg` (events);
`src/data/media.json`/`events.json` updated via a new, kept
`scripts/update-trailer-event-photos.mjs` (same reusable-tool precedent
as `gen-merch-data.mjs`), with real per-item alt text and honest credit
text naming the photographer and stating plainly these are generic stock
photos, not real footage or event photography.

Two test fixes this required, both the same sanctioned pattern already
used earlier this project for new asset batches:
`contentValidation.test.ts`'s existence-check glob widened from
`{svg,png}` to `{svg,png,jpg}`; `docs/asset-manifest.json` regenerated
(`node scripts/generate-asset-plan.mjs`) since the 14 trailer thumbnails'
Tier-C `replaces:` pointers went stale — Tier B's 70-asset scope verified
untouched (`git diff | grep tier.*B` = 0 lines).

### 3. Price format

All 5 places a price renders (`MerchandisePage`, `ProductDetailPage`,
`CategoryHubPage` ×2, `CartPage`) showed `{currency} {min}–{max}`
(currency first). Reformatted to put the currency after the number via
two new small helpers in `src/utils/formatPrice.ts`
(`formatPriceRange`/`formatPrice`), used everywhere instead of five
separate inline template strings. `CartPage`'s running total previously
had no currency at all — fixed the same way (every item in the catalogue
is USD, so it's passed explicitly rather than invented per-line).

### 4. Header search felt cramped

FR-009 requires search "present in global header on every route" — the
existing inline field already had a responsive fallback for narrow
viewports (an icon that reveals the same `GlobalSearchBar` in a
full-width panel below the bar); this session made that the **only**
behaviour, at every width, instead of just <1280px. The icon stays a
top-level `.bar` child (not nested in `.account`, which is `display:
none` below the desktop tier — nesting it there would have hidden search
entirely on mobile/tablet, caught before shipping). `.bar`'s grid lost
the old 190–280px search-field track; the navigation and account
controls now have real room at every width that used to feel tight.

`e2e/keyboard-walkthrough.spec.ts`'s "SEARCH" leg updated: it used to
Shift+Tab directly to an always-present `<input type="search">`; now it
Shift+Tab's to the toggle button (identified via `aria-controls`),
activates it with Enter, and relies on the existing focus-on-open effect
(`Header.tsx`) to land in the newly-rendered input — same assertions,
adapted entry point.

### Files changed

```
src/components/Footer/Footer.module.css
src/pages/ContactPage.module.css
src/data/media.json                        (14 trailer thumbnails)
src/data/events.json                       (21 event images)
src/data/contentValidation.test.ts          (glob widened, +jpg)
docs/asset-manifest.json                    (regenerated, Tier B untouched)
scripts/update-trailer-event-photos.mjs     (new, kept as a reusable tool)
public/assets/generated/media-photo/*.jpg   (7 new)
public/assets/generated/event-photo/*.jpg   (7 new)
src/utils/formatPrice.ts                    (new)
src/pages/MerchandisePage.tsx
src/pages/ProductDetailPage.tsx
src/pages/CategoryHubPage.tsx
src/pages/CartPage.tsx
src/components/Header/Header.tsx
src/components/Header/Header.module.css
e2e/keyboard-walkthrough.spec.ts
```

### Tests

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run build` | clean |
| `npm run test` (Vitest) | **189 / 189** |
| `contentValidation.test.ts` + `assetManifest.test.ts` | 58/58 (after the glob widen + manifest regen) |
| `e2e/keyboard-walkthrough.spec.ts` + `dialog-architecture.spec.ts` + `navigation.spec.ts` + `responsive.spec.ts` | **51 / 51** |
| Manual browser check (Playwright-driven) | 0 console errors across every touched route; email links confirmed `text-decoration: none`; merchandise price confirmed `35–50 USD`; header confirmed less cramped with a working search-icon → panel flow; Trailers/Events confirmed showing real photos |

### Git

Before: `master`, HEAD `e991e65`, working tree clean (from the UI polish
session). After: same branch, same HEAD, 14 files modified + 1 new script
+ 14 new image assets.

**No `git commit` was performed. No `git push` was performed.**

---

## UI/COPY CLEANUP — FOOTER / CART / BOOKMARKS / LOGIN / REGISTER — 2026-09-26

**Not committed.** Continuing on top of the previous session's uncommitted
work (still on pushed commit `0e06439`, `e991e65` local-only, etc.).
Reference images (SportHub login/register mockups) used **only** for
layout/hierarchy/spacing inspiration, per director instruction — no
SportHub branding, copy, or colour copied; brand stayed FandomVerse
throughout.

### A real conflict found and resolved before implementing

The task asks to remove phrases like "does not create a real account",
"no checkout, payment, or real purchase", and "temporary" from Login/
Register/Cart — but two existing tests in `e2e/content-honesty.spec.ts`
asserted those exact phrases as part of the site's established
"no deceptive UI" policy. Flagged to the director before writing any
code; instructed to remove the wording as asked and update the tests to
match the new copy (not silently break the suite, not silently ignore
the instruction). Both tests were rewritten to verify the same underlying
guarantee a different way — see "Login / Register" below.

### Footer cleanup

Removed both legal paragraphs ("A student/competition project — not a
real commercial storefront." and "Content is illustrative/original. See
project documentation for AI-usage and licensing policy.") — replaced
with exactly `© {year} FandomVerse_FPT_Aptech`. The `Developed by TECH4 ·
FPT Aptech` / email credit block (added in the prior "About Us / Contact
/ Footer" session) is untouched — this task never asked for it to be
removed. Chatbot launcher untouched. `.legal`'s now-unused
`justify-content: space-between`/`.note` rule removed since there's only
one line left to lay out.

### Cart copy cleanup

`PagePlaceholder` title "Your cart" → "Your Cart"; description rewritten
from a storage/technical disclaimer to "Items you've added from the
Merchandise collection, ready whenever you want to check back." Empty
state kept its existing "Your cart is empty" heading (already matched)
and got the director's suggested supporting line ("Explore the
Merchandise collection…"). The running total's trailing "— temporary,
demo cart only" clause was dropped; it now just reads "Total: {price}
USD". Behaviour (localStorage persistence, no real checkout) is
unchanged — only stated nowhere in the UI now.

### Bookmarks copy cleanup

`PagePlaceholder` description rewritten from a localStorage/sessionStorage
explanation to "Save your favorite FandomVerse content and come back to
it anytime." The per-note textarea's placeholder ("Personal note (this
session only)") had its "session" wording dropped too ("Add a personal
note"). Empty state text was already clean (no change needed). Bookmark/
note persistence behaviour is unchanged.

### Login / Register redesign

`DummyAuthModal.tsx` — same single-component, mode-toggled architecture
as before (`mode: 'login' | 'signup'`), same `Dialog` primitive, same
`setDummyLoggedIn(true)` on submit. Changed:

- Dropped the "(demo)" suffix from the dialog title and the header's
  "Log out (demo)" button, and removed the disclaimer paragraph entirely
  ("This form is for demonstration only…").
- New copy: title "Welcome back" / "Create your account" (using
  `Dialog`'s own `description` prop for the subtitle, rather than hand-
  rolling a second heading) — "Sign in to continue your FandomVerse
  experience." / "Join FandomVerse and start building your fandom
  journey." Submit button "Log in" / "Create account". Switch-mode link
  "Don't have an account? Sign up" / "Already have an account? Log in".
- Added a real, working password-visibility toggle (`Show`/`Hide` text
  button — no emoji, no new icon library, same typographic-icon
  convention the rest of the chrome already uses) and a "Remember me"
  checkbox (login mode only, matching the reference) — genuinely
  interactive, but not wired to any persistence, matching `useUiStore`'s
  own documented in-memory-only boundary for `isDummyLoggedIn`.
- **Did not add**: social login (Google/Facebook — no real OAuth
  implementation exists anywhere in this codebase, and the task
  explicitly forbids fake provider buttons), a divider ("or continue with
  email" — nothing to divide from without social login), a "Forgot
  password?" link (no reset flow exists; a dead link would be worse than
  no link), or any Register-only fields (first/last name, phone, confirm
  password, terms checkbox — none currently exist in the form's logic,
  and the task's own instructions gate all of these on "if it currently
  exists"). Email + Password remain the only fields, for both modes,
  matching the current, unchanged logic exactly.
- Card widened from `size="sm"` (360px) to `size="md"` (480px) — a
  `Dialog` prop change only, not a `Dialog.module.css` edit, so
  `ChatbotLauncher`'s dialog (the component's other consumer) is
  unaffected.
- `e2e/content-honesty.spec.ts`'s auth test rewritten (see "conflict"
  above): was a text assertion on the removed disclaimer; now asserts the
  same underlying guarantee behaviourally — submitting issues no network
  request, does not navigate away, and the header flips to a real
  "Log out" control, confirming the whole exchange stayed local without
  the dialog having to say so.

### Files changed

```
src/components/Footer/Footer.tsx
src/components/Footer/Footer.module.css
src/pages/CartPage.tsx
src/pages/BookmarksPage.tsx
src/components/DummyAuth/DummyAuthModal.tsx
src/components/DummyAuth/DummyAuthModal.module.css
src/components/Header/Header.tsx           ("Log out (demo)" → "Log out")
e2e/content-honesty.spec.ts                (2 tests rewritten)
```

Not touched: Hero, Header layout/navigation, Category pages, Merchandise
listing/detail, Quiz, Trailers, Events, any backend/auth infrastructure
(none exists; none was added).

### Responsive

Checked 1280×900 (desktop), 768×1024 (tablet), 375×812 (mobile), and
320×700 (small mobile) via Playwright: the auth dialog has zero
horizontal overflow at any of these (`scrollWidth === clientWidth`
throughout, even at 320px), stays centred, and the chatbot launcher does
not obscure it. Footer/Cart/Bookmarks screenshots reviewed at desktop and
mobile — no broken layout, no abnormal empty space after the footer text
removal.

### Tests / validation

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run build` | clean |
| `npm run test` (Vitest) | **189 / 189** (unchanged — no Vitest files touched this session) |
| `e2e/content-honesty.spec.ts` | **29 / 29** (2 tests rewritten to match the new copy/behaviour, all others unaffected) |
| Manual browser check (Playwright-driven) | 0 console errors across Footer/Cart/Bookmarks/Login/Register; footer confirmed to render exactly `© 2026 FandomVerse_FPT_Aptech`; password-visibility toggle confirmed to actually change the input's type; Login and Register screenshots reviewed at desktop and mobile |

### Git

Before: `master`, HEAD `e991e65`, working tree carried over from the
prior (uncommitted) trailer/event-photo session. After: same branch, same
HEAD, working tree extended with this session's changes (see Files
changed above).

**No `git commit` was performed. No `git push` was performed.**

---

## CONTENT GRID + CART IMAGE POLISH — 2026-09-26

**Not committed.** Continuing from `9bb5950` (real trailer/event photos,
price formatting, header search cleanup, professional UI copy).

### Problem

Merchandise, Trailers and Events used the full-width grid mechanism
(`Grid`'s `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`, already the
exact CSS Grid pattern the task recommended) but the grid itself was never
the bottleneck: all three pages render through `PagePlaceholder`, whose
`.wrapper` caps at `max-width: 720px` — correct for a reading column
(About, Contact, Search) but capping the Grid to a single narrow column of
cards at desktop width, leaving a large empty right-hand gutter.

### Files read before changing anything

`src/components/ui/Grid/Grid.tsx`, `src/components/PagePlaceholder/PagePlaceholder.tsx`
+ `.module.css`, `src/pages/MerchandisePage.tsx`, `TrailersPage.tsx`,
`EventsPage.tsx`, `src/pages/CartPage.tsx` + `.module.css`,
`src/components/ui/Layout/Layout.module.css`,
`src/features/explore/ExploreCinematicHero.module.css` (confirmed
full-bleed, unaffected by wrapper width — no risk to the hero).

### Fix — Merchandise / Trailers / Events grids

Added an opt-in `wide?: boolean` prop to `PagePlaceholder` (default
`false`, so About/Contact/Search/Cart/Bookmarks keep their existing
720px reading width unchanged). When `wide` is set, `.wrapper` also
receives `.wide { max-width: var(--content-max-width) }` (1440px — the
same token the global `Container` already uses elsewhere). `MerchandisePage`,
`TrailersPage` and `EventsPage` each pass `wide` on their existing
`<PagePlaceholder>` call — one attribute added per file, nothing else
changed. No Grid mechanism, card markup, data, or asset was touched.

Verified via Playwright (computed `gridTemplateColumns` column count +
`scrollWidth`/`clientWidth` overflow check) on all three pages: **5
columns at 1440px, 3 at 768px, 1 at 375px**, zero horizontal overflow at
any width, zero console errors. Screenshots reviewed confirming full-width
card distribution, no large empty gutter.

### Fix — Cart product thumbnail

`CartPage.tsx` already resolved each line item's full `product` record via
`merchandise.find((entry) => entry.id === item.merchandiseId)` (cart state
only ever stored the id) — so "resolve from existing merchandise data by
id, no new assets, no hardcoded mapping" was already satisfied
architecturally. Added a 64×64 (48×48 under 599px) `<img>` reading
`product.image.src` / `.alt` directly from that same record, laid out
beside the existing name/price line via two new flex wrapper classes
(`.lineItem`, `.productInfo`) in `CartPage.module.css`; quantity controls
and Remove button are untouched.

Verified end-to-end: added a real product via ProductDetailPage → `/cart`
shows a decoded (non-broken) thumbnail (`naturalWidth` 2048), quantity
increase/decrease (1→2→1) still works, Remove still empties the cart,
`flex-wrap` reflows quantity controls to their own row at 375px with no
overflow, zero console errors.

### Regression found and fixed during this phase's own validation

Running `persistence.spec.ts` alongside `responsive.spec.ts` (this
phase's own required "run relevant tests" step) surfaced one failure
unrelated to the grid/thumbnail work: `e2e/persistence.spec.ts`'s
"a bookmark note is readable" test still looked for the placeholder
`"Personal note (this session only)"`, which the prior UI/Copy Cleanup
session had already changed to `"Add a personal note"` — that session ran
`content-honesty.spec.ts` but never `persistence.spec.ts`, so the
regression sat undetected for one full phase. Fixed the locator string to
match current UI text (`e2e/persistence.spec.ts:72`), with an inline
comment recording why. Re-verified: 3/3 passed.

### Files changed

```
src/components/PagePlaceholder/PagePlaceholder.tsx        (new `wide` prop)
src/components/PagePlaceholder/PagePlaceholder.module.css (new `.wide` class)
src/pages/MerchandisePage.tsx                              (`wide` attribute)
src/pages/TrailersPage.tsx                                 (`wide` attribute)
src/pages/EventsPage.tsx                                   (`wide` attribute)
src/pages/CartPage.tsx                                     (product thumbnail)
src/pages/CartPage.module.css                               (`.lineItem`, `.productInfo`, `.thumbnail`)
e2e/persistence.spec.ts                                     (stale placeholder locator fixed — genuine regression, see above)
```

Not touched: Header, Footer, Hero, Category hub pages, Fandom Quiz,
Login/Register, Bookmarks, Chatbot, any data file, any asset, card
markup/design, dependencies.

### Tests / validation

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run build` | clean |
| `npm run test` (Vitest) | **189 / 189** (unchanged — no Vitest-covered source file touched this phase) |
| `e2e/content-honesty.spec.ts` | **29 / 29** — no new scaffolding/honesty regression from the grid/thumbnail changes |
| `e2e/persistence.spec.ts` | **3 / 3** (was 2/3 before the placeholder-locator fix above) |
| `e2e/responsive.spec.ts` (+ `persistence.spec.ts` together) | **43 / 43** |
| Manual Playwright checks | Merchandise/Trailers/Events: 5/3/1 grid columns at 1440/768/375px, 0 overflow, 0 console errors. Cart: thumbnail decodes, quantity + remove behaviour intact, 0 overflow at 375px. |

### Git

Before: `master`, HEAD `9bb5950`. After: same branch, same HEAD, working
tree extended with this phase's changes (see Files changed above).

**No `git commit` was performed. No `git push` was performed.**
