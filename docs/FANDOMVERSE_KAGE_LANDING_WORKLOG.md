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
