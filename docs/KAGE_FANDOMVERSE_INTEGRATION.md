# FandomVerse — Kage Integration

Work log and handoff document. Updated as the integration proceeds.

**Started:** 2026-09-24 · **Branch:** `master` · **Base commit:** `a69c50f`
**Status:** Phases 0–13 complete. Landing rebuilt on the Kage interaction
architecture. Director decisions recorded in §6.

---

## 1. Objective

Rebuild the FandomVerse landing page on the interaction architecture of the
Kage cinematic scroll experience: a continuous world travelled by scrolling,
with the seven FandomVerse categories as chapters, editorial typography, a
chapter rail, layered artwork and atmospheric motion — replacing the current
hero → cards → grid → CTA structure.

Kage supplies the *experience grammar*. FandomVerse supplies brand,
categories, characters, content, navigation and identity.

---

## 2. Reference Sources

| Source | URL | How it was consulted |
|---|---|---|
| Kage repository | `github.com/MengTo/kage` | Cloned (`--depth 1`) and read directly: `index.html` (4,821 lines), `PROMPT.md`, `README.md`, asset tree. |
| ThreeUI catalogue entry | `threeui.com/landing-pages/kage-landing-page` | Fetched. Page is a client-rendered SPA; shell HTML and registry paths probed directly. |
| ThreeUI project | `github.com/MengTo/threeui` | Identified as the catalogue's own repository (same owner as Kage). |
| npm | `threeui-cli` | Metadata inspected. **Not run** — see §4 *Installation model*. |

---

## 3. Current Repository State

Read before any change: `docs/LANDING_STATUS.md`, `docs/TEAM_HANDOFF.md`,
`docs/UI_INTEGRATION_CONTRACT.md`, `docs/TEST_CHECKLIST.md`,
`docs/11_DECISION_LOG.md` (D-001…D-056).

- **Stack:** React 19.2, TypeScript strict, Vite 8, CSS Modules, Zustand 5.
- **Router:** `createHashRouter`. Raw `#fragment` writes and
  `window.location.search` reads corrupt routing (D-032).
- **3D:** `three@0.186`, `@react-three/fiber@9.8`, `@react-three/drei@10.7`.
  `FandomCoreScene` is lazy-loaded into a separate 912 kB chunk.
- **Landing:** seven section components in `src/sections/`, composed by
  `HomePage.tsx`. Image transfer 1.0 MB (WebP renditions).
- **Tests at baseline:** lint clean, typecheck clean, 142/142 Vitest,
  **713 passed / 0 failed / 0 flaky** Playwright, build clean.
- **Working tree:** 24 uncommitted entries from the previous landing phase.
  Not reset, not committed, not touched.

---

## 4. Kage Architecture Audit

Analysis only. No Kage source is reproduced here or copied into this project.

### Kage Runtime

Single `index.html`, 4,821 lines, no build step. A **vendored Three.js r149**
(`three.min.js`, 594 kB unminified-equivalent) is loaded by `<script>` tag,
followed by roughly 3,600 lines of inline JavaScript.

There is no framework, no module system and no package manager. The whole
application is one global script.

### Environment

The scene is **procedurally generated at runtime** — nothing is loaded as a 3D
model. The inline script contains generators for:

- Noise primitives (`mulberry32`, `noise2D`, `fbm`) feeding every texture.
- Canvas-drawn textures: wall, floor, wood, stone, lacquer, shoji, leaf, sky,
  ridge, roof, moon, glow, wisp, and alpha cutouts for grass, rock and branch.
- Geometry builders: `buildShell`, `buildTemple`, `buildTorii`, `buildMoon`,
  `roofGeo` (a concave Chebyshev-distance height function), `sweepPoly`,
  `mergeGeos`.
- Atmosphere: fog, depth haze, precipitation, drifting leaves, particles.
- Post-processing: bloom, film grain, vignette, warm shoji light against cool
  moonlight, a vermilion moon.

This is a purpose-built Kyoto mountain temple. It is not parameterised into
anything else.

### Artwork

| Class | Count | Form |
|---|---|---|
| Generated scene plates | 4 | `kage-approach`, `kage-lantern-court`, `kage-moonwater`, `kage-sanmon-preview` — WebP, 100–196 kB |
| Foreground cutouts | 10 | `basalt-stones`, `garden-bush`, `hill`, `maple-leaves`, `pine-tree`, `sakura-branch`, `shrine-ruins`, `stone-lantern`, `tall-grass`, `temple-wall` — alpha-preserving WebP, 84–344 kB |
| Fonts | 1 family | Onest, base64-embedded WOFF2 in `fonts.css`. **No remote fonts.** |

Total repository size 6.5 MB. Every asset is local and relative-pathed for
GitHub Pages subpath hosting.

**Subject matter:** all fourteen images are Japanese temple-garden subjects —
burned cedar walls, torii, stone lanterns, sakura, maple, shrine ruins.

### Interaction — the transferable core

This is the part worth reinterpreting, and it is compact:

1. **Sections declare a camera keyframe.** Each `<section>` carries
   `data-cam="N"`. `SECS = querySelectorAll('[data-cam]')`.
2. **`measure()` computes a scroll anchor per section** — the section's centre
   aligned to the viewport centre, clamped to `[0, maxScroll]`, with the first
   pinned to `0` and the last to `maxScroll`. Anchors are then forced strictly
   increasing.
3. **`progressFor(y)` returns a *fractional chapter index*.** A scroll position
   between anchors `i` and `i+1` yields `i + fraction`. So `2.37` means "37% of
   the way from chapter 2 into chapter 3".
4. **That single float drives everything** — camera position, look-at target and
   FOV are interpolated between keyframes; so are atmosphere, foreground stage
   state and the active chapter rail entry. There are no discrete scene swaps.
5. **Frame-rate-independent damping:** `damp(cur, to, rate, dt) =
   lerp(cur, to, 1 - exp(-rate * dt))`. Camera never snaps to the scroll value;
   it eases toward it every frame.
6. **`fitAspect`** adjusts FOV by viewport shape, and the wordmark layout
   branches on `vpW/vpH < 1.05` rather than on width — a portrait tablet is
   treated like a phone, because what breaks the composition is a *tall* frame,
   not a narrow one.
7. **Foreground staging.** Cutouts are owned by their section until that
   chapter becomes active, at which point the stage is re-parented into a fixed
   lower-viewport plane. The outgoing chapter's stage stays on that plane just
   long enough to blur and fade before returning home. This is what makes
   transitions read as continuous rather than as cuts.
8. **Word-level heading reveal.** `splitHeadingWords()` rewrites each display
   heading into `<span class="word-mask"><span class="word">` pairs with a
   `--word-delay` of `i * 72ms`. The original phrase is preserved as
   `aria-label` and the word spans are `aria-hidden`. Skipped entirely when
   reduced motion is set.
9. **Grouped reveals.** `[data-rv]` elements are grouped by parent and given a
   stagger of `i * 85ms`; an `IntersectionObserver`
   (`rootMargin: 0px 0px -10% 0px`, `threshold: .04`) adds `rv-in` once and
   unobserves. Hero elements are excluded — they animate on load instead.

### Typography

Oversized left-aligned English display headings; large vertical Japanese
display elements; small technical labels (`01 — The Sanmon`) paired with a thin
rule; chapter numbers as a first-class element; generous negative space. Each
chapter opens with a `sec-head` label row, then an oversized `h2`, then a lead
paragraph, body copy, an arrow link, and a numeric stat row.

### Responsive

Composition branches on frame *shape*, not width. Mobile reduces layer count
and typography scale rather than scaling the desktop composition down. The
custom cursor is pointer-device only.

### Performance

Local assets only; lazy `loading="lazy" decoding="async"` on every foreground
image with explicit `width`/`height`; no analytics, no remote fonts, no CDN,
no runtime network dependency.

### Installation model — findings

- The ThreeUI catalogue entry describes Kage, in its own metadata, as *"the
  complete authored Kage temple experience, **preserved as an interactive
  full-page document** with its original navigation, scroll scenes, and local
  Three.js"*. It is catalogued as a document, **not as an installable
  component**.
- `threeui.com/r/*.json`, `/registry/*.json` and `/registry.json` all return
  the same 72 kB SPA shell (`text/html`). **There is no registry endpoint** at
  the conventional shadcn-style paths.
- `threeui-cli` **does** exist on npm (v0.3.1) but is published by
  `jinhyuk9714` from `github.com/sjh9714/threeui-cli` — a **different owner**
  from `MengTo`, who owns both `threeui.com` and the Kage repository. Its own
  description is "Find ThreeUI **Community** components".

  Running `npm exec threeui-cli add kage-landing-page` would execute an
  unverified third party's code against this repository. **It was not run.**
  If the Director wants it run, that is a deliberate supply-chain decision and
  should be recorded as such.

**Conclusion:** there is no supported package installation path. Any
integration is manual by necessity.

---

## 5. Permission & Attribution

### What the repository states

The Kage repository contains **no `LICENSE` file**. Its `README.md` §License
states verbatim:

> "No license is currently granted for reuse or redistribution of the original
> Kage code or artwork. The third-party Three.js runtime remains covered by its
> included MIT license notice."

§Design and attribution states the scene plates and foreground artwork were
generated with GPT Image 2 and art-directed for that project.

### What the Director states

The Director has stated that permission to use the Kage artwork in FandomVerse
was obtained directly from the rights holder. A private grant supersedes the
absence of a public one, so this is recorded as the operative permission.

### TODO — must be supplied before any public deploy

The repository carries no attribution information, and none may be invented.
The following are unknown and must come from the Director:

- [ ] Name of the rights holder who granted permission
- [ ] Date of grant
- [ ] Scope and terms of the grant (production use? redistribution? modification?)
- [ ] Required attribution text and where it must appear
- [ ] Whether the grant covers the **code** as well as the artwork

Until these are filled in, `docs/08_LICENSES.md` and `docs/ASSET_PROVENANCE.md`
cannot be updated accurately, and no Kage-derived asset should ship publicly.

---

## 6. Integration Strategy

### What cannot be carried over, and why

**The Kage 3D scene itself.** It is ~3,600 lines of vanilla global-scope
JavaScript against a vendored Three.js **r149**. FandomVerse runs React 19 with
`three@0.186` and `@react-three/fiber@9.8`. Adopting Kage's runtime would mean
shipping **two incompatible copies of Three.js** (r149 alongside 0.186) and a
global script alongside a module graph. The result would be roughly 1.5 MB of
duplicated 3D runtime and two renderers competing for WebGL contexts.

More fundamentally, the scene is not a generic engine — it is a hard-coded
Kyoto temple generator. There is no parameter that turns it into a fandom
universe.

**What carries over instead is the architecture**, which is genuinely portable
and is the valuable part: fractional chapter progress from scroll, damped
interpolation between per-chapter keyframes, foreground staging with
blur-and-fade handoff, word-level heading reveals, the chapter rail, and the
editorial typographic system. All of this can be implemented natively in React
against the Three.js already in the project.

### Proposed structure

```
INTRO (hero world)
  ↓
CHAPTER 01–07  (one per FandomVerse category)
  ↓
UNIVERSE STATEMENT
  ↓
FINAL CTA
```

Driven by a `useChapterProgress` hook implementing Kage's anchor/`progressFor`
maths, feeding both a fixed environmental canvas and the DOM chapter layers.

---

## 7. Implementation Phases

### Phase 0 — Repository Audit — **COMPLETE**
- **Inspected:** git state, `package.json`, `src/`, `public/`, `docs/`, `e2e/`, the four landing handoff docs, decision log.
- **Changed:** nothing.
- **Problems:** none.
- **Next:** Kage source audit.

### Phase 1 — Kage Source Audit — **COMPLETE**
- **Inspected:** cloned repo; `index.html` structure, scroll/camera system, reveal system, foreground staging, typography, asset tree, fonts, license.
- **Changed:** nothing in the project.
- **Problems found:** (1) no license granted by the repo — §5; (2) runtime is incompatible with this project's stack — §6.
- **Next:** ThreeUI installation audit.

### Phase 2 — Kage Installation — **COMPLETE (no installable path exists)**
- **Inspected:** ThreeUI catalogue page, registry path probes, npm packages `threeui-cli` / `threeui` / `@threeui/cli`.
- **Findings:** Kage is catalogued as a full-page document; no registry endpoint; the only `threeui-cli` on npm is third-party community software from a different owner. Not run.
- **Changed:** nothing.
- **Next:** blocked — see §12.

### Phase 3 — Kage Baseline — **COMPLETE (studied, not adopted)**
- The cloned Kage runs as a static `index.html`. It was read in full rather
  than run as a dependency — see Phase 4 for why adopting its runtime inside
  FandomVerse was rejected on stack-compatibility grounds, not on quality.
- **Changed:** nothing.

### Phase 4 — FandomVerse Adaptation — **COMPLETE**
- Ported the architecture, not the code: `useChapterProgress` implements
  Kage's anchor / `progressFor` maths and exponential damping in React.
- One float, `--chapter-progress`, is written to the stage element once per
  animation frame. Nothing re-renders on scroll.
- **Files:** `src/features/landing/useChapterProgress.ts`.

### Phase 5 — Seven Chapters — **COMPLETE**
- `CategoryChapter` renders any category as a composed shot; `HomePage` maps
  `CATEGORY_ROUTES` over it. Chapter space: 0 intro, 1 contents, 2–8 the
  seven categories, 9 statement, 10 final CTA.
- **Files:** `src/sections/CategoryChapter.tsx`, `ChapterIntro.tsx`,
  `ChapterIndex.tsx`, `UniverseStatement.tsx`, `src/pages/HomePage.tsx`.

### Phase 6 — Artwork Integration — **COMPLETE**
- Director decision: **FandomVerse Batch 01 artwork drives all seven
  chapters.** No Kage artwork is used — see §12 problem 4.
- Each chapter composes a wide category plate (1920px WebP), a depth haze, the
  lead's portrait feathered into the scene by a two-axis mask, and a
  foreground vignette.
- Masters untouched; the runtime serves `public/assets/gemini/web/`.

### Phase 7 — Animation — **COMPLETE**
- Word-level heading reveal (`WordReveal`), grouped element reveals
  (`Reveal`), per-layer parallax from the shared progress float, sticky stages
  that hold each shot, a drifting mote field, and the rail's active state.
- **Problem found and fixed:** chapters met the page on a hard horizontal
  line. Added a non-parallaxing `.edges` layer that dissolves the top and
  bottom of every shot into the background.

### Phase 8 — Responsive — **COMPLETE**
- A phone gets a different composition, not a smaller one: the lead becomes a
  backdrop above the type block, parallax throw drops from 12vh to 4vh, the
  rail collapses to ticks and disappears below 600px, and mote density and
  DPR are both reduced.
- **Problems found and fixed:** the scroll cue overlapped the statement on a
  phone (the header is three rows tall there), and the sticky header cropped
  the lead's head.

### Phase 9 — Accessibility — **COMPLETE**
- Semantic landmarks, one `<h1>`, no skipped levels, the rail as a real
  `<nav>` of buttons with `aria-current`, word-reveal masks `aria-hidden`
  behind an `aria-label`, and reduced motion that keeps all content.
- **Problem found and fixed:** the rail's chapter numerals measured 3.41:1
  against the background — below WCAG AA for 12px text. Caught by axe on
  WebKit. Opacity raised 0.55 → 0.80, measured 6.04:1.

### Phase 10 — Performance — **COMPLETE**
- Image transfer ~1 MB, budget-enforced at 4 MB. No CDN, no remote fonts, no
  new dependency. A 2D canvas rather than a second WebGL context. DPR capped
  at 2, or 1.5 on small screens. Mote count scaled by viewport area.
- **Problem found and fixed:** the atmosphere was `position: fixed` and went
  on painting over the site footer; it is now a clipped sticky field bounded
  by the landing stage.
- **Problem found and fixed:** `ResizeObserver` was assumed to exist. Both
  consumers now feature-detect it, so an environment without it loses
  re-measurement rather than the page.

### Phase 11 — Testing — **COMPLETE**
- lint clean · typecheck clean · **142/142** Vitest · **717 passed / 0
  failed** Playwright across chromium, firefox, webkit and mobile-chrome ·
  build clean.
- `e2e/landing.spec.ts` rewritten for the chapter architecture: 10 tests
  covering structure, outline, hub links, per-chapter entry links, keyboard
  rail operation, image decode, the image budget, console cleanliness, 320px
  overflow, and reduced-motion content parity.
- No existing test was weakened or deleted.

### Phase 12 — Visual QA — **COMPLETE**
- Inspected in a real browser at 1440x900 and 390x844, walking every chapter.
- Findings and fixes are listed in §13. Three of them — the vanished mobile
  leads, the hard figure edge, and `"TVShows"` — were invisible to every
  automated check: no console error, no 404, no failing assertion, correct
  bounding boxes and `naturalWidth`. They were found by looking, and the
  mask bug in particular was only isolated by overriding `mask-image` live in
  the browser and re-screenshotting.
- **Method note:** chapter screenshots taken by a fixed scroll increment are
  unreliable for judging a sticky-stage page — a frame can land between
  chapters and look like a missing asset. Capture by scrolling a chapter's
  heading into view instead.

### Phase 13 — Finalization — **COMPLETE**
- Handoff docs updated. Not committed, per instruction.

## 8. Architecture Decisions

Promoted to `docs/11_DECISION_LOG.md` as D-057…D-061.

| # | Decision |
|---|---|
| D-057 | The landing is a chapter sequence driven by one fractional progress float, written to a CSS custom property once per frame. Nothing re-renders on scroll. |
| D-058 | Kage's *architecture* is ported; none of its code or artwork is used. |
| D-059 | The environmental layer is a 2D canvas, not a second WebGL context. |
| D-060 | Each chapter is a sticky, viewport-height stage inside a taller section, so the shot holds instead of cutting. |
| D-061 | Chapter CTAs are named for the franchise ("Enter Starlit Ronin"), never "Explore {Category}", which the Fandom Core already owns for all seven. |

## 9. Files Added

```
src/features/landing/useChapterProgress.ts
src/features/landing/AtmosphereCanvas.tsx + .module.css
src/features/landing/ChapterRail.tsx + .module.css
src/features/landing/WordReveal.tsx + .module.css
src/features/landing/chapterAccents.ts
src/sections/ChapterIntro.tsx + .module.css
src/sections/ChapterIndex.tsx + .module.css
src/sections/CategoryChapter.tsx + .module.css
src/sections/UniverseStatement.tsx + .module.css
docs/KAGE_FANDOMVERSE_INTEGRATION.md
```

## 10. Files Modified

```
src/pages/HomePage.tsx + .module.css    rebuilt as chapter composition
src/sections/FinalCta.module.css        restyled to the editorial language
src/features/universe/CinematicEntry.module.css
                                        height made overridable; default unchanged
src/styles/tokens.css                   added --space-page-gutter
e2e/landing.spec.ts                     rewritten for the chapter architecture
docs/11_DECISION_LOG.md                 D-057…D-061
```

## 11. Files Preserved

- **All content data.** `categories.json` (7) and `characters.json` (35) are
  byte-identical, as is every other dataset.
- **All approved artwork.** `_gemini_batch_01/` and `public/assets/gemini/`
  untouched.
- **`CinematicEntry.tsx`** and its whole progressive-enhancement stack.
- **Every existing test.** None weakened, none deleted.
- **The superseded landing sections** — `LandingHero`, `CategoryExplorer`,
  `FeaturedCharacters`, `UniverseIntro`, `HowItWorks`, `FeaturedStories` —
  remain on disk, now unreferenced. They tree-shake out of the bundle.
  Deleting them is the Director's call.

## 12. Problems Found

| # | Problem | Severity | State |
|---|---|---|---|
| 1 | Kage repo grants no license for reuse of code or artwork; no attribution details exist to record | High | Director states private permission obtained; attribution TODO open (§5) |
| 2 | No installable ThreeUI package for Kage; the only npm `threeui-cli` is third-party from a different owner | Medium | Not run. Manual integration required. |
| 3 | Kage runtime (vanilla + Three r149) is incompatible with FandomVerse (React 19 + Three 0.186 + r3f); adopting it ships two Three.js copies | High | Resolved by porting the architecture rather than the runtime (§6) |
| 4 | **Kage's artwork is Japanese temple subject matter.** All fourteen images are torii, sakura, stone lanterns, shrine ruins and temple walls. FandomVerse's seven worlds are an anime ronin epic, a military shooter, a noir thriller, an archive mystery, a K-pop group, a superhero comic and a supernatural manga. | High | **BLOCKING — needs Director decision** |

### On problem 4

This is not a licensing question; it is an art-direction one. Placing a sakura
branch and a burned cedar temple wall in the foreground of the *LUNARIS — K-Pop*
chapter, or torii gates behind *Ashfall Protocol — Gaming*, would not read as
one universe. The previous phase's own visual quality gate requires that
"artwork feels integrated into the world" and that the page must not look like
a template with the text changed.

Meanwhile FandomVerse already holds fourteen Director-approved, watermark-clean
Batch 01 assets built specifically for these seven worlds — one hero plate and
one lead portrait per category — which is exactly the plate-plus-cutout pairing
Kage's composition grammar needs.

## 13. Problems Fixed

Found by looking at the page in a browser, not by tests:

| # | Problem | Fix |
|---|---|---|
| 1 | Chapters met the section above them on a hard horizontal line — a cut, in a page whose whole premise is continuity | Non-parallaxing `.edges` layer dissolving both ends of every shot |
| 2 | The lead's portrait showed its own rectangular top edge; the second mask faded the bottom, not the top | Mask corrected to `to bottom` |
| 3 | The intro's statement and scroll cue fell below the fold | Core height made overridable and reduced here; intro sized to `100dvh − header` |
| 4 | On a phone the pinned scroll cue overlapped the statement | Cue returns to flow below 600px |
| 5 | On a phone the sticky header cropped the lead's head | Figure offset below the measured header height |
| 6 | The rail overlapped the right column of the two full-width text sections | Right-padding clearance from 600px up |
| 7 | The atmosphere kept painting over the site footer | Clipped sticky field bounded by the landing stage |
| 8 | The closing CTA was still a bordered, centred card against seven full-bleed chapters | Restyled full-bleed and left-aligned, with the same edge dissolve |
| 9 | Rail numerals at 3.41:1, below WCAG AA | Opacity 0.55 → 0.80, measured 6.04:1 |
| 10 | `ResizeObserver` assumed to exist; the page threw in jsdom | Feature-detected in both consumers |
| 11 | **Every lead vanished on phones.** The figure was masked with two layers composited by `mask-composite`; the legacy `-webkit-mask-composite: source-in` intersects a single layer with an empty accumulated mask, so the moment the phone breakpoint reduced the image to one layer the whole figure was erased | Restructured so each element carries exactly **one** mask layer: the top feather on the `.figure` wrapper, the side feather on the image. No `mask-composite` anywhere |
| 12 | Removing the image's second mask layer exposed a hard horizontal line at the top of each figure on desktop | The wrapper's own top feather replaced it |
| 13 | `"TV Shows"` rendered as `"TVShows"` | The word separator sat *inside* an `overflow: hidden` mask span; moved between masks |
| 14 | **Characters vanished mid-scroll on a 375px phone.** `will-change: transform` promoted 14 permanent composited layers; under that pressure Chromium stopped rasterising some, while geometry, opacity, decode state and paint order all still reported correctly | Removed `will-change` from `.plate` and `.figure`; released it on `.word` after its reveal |
| 15 | **"Enter the universe" never rendered at 1024×768.** It sat inside the reveal observer's negative `rootMargin` on a short fold, never met the threshold, and stayed at `opacity: 0` | `Reveal` gained an `immediate` prop; everything in the opening screen now reveals on mount |
| 16 | The intro's pinned scroll cue collided with the statement at 1024×768, having already done so on a phone | Cue moved into flow at every width — it can no longer overlap what precedes it |
| 17 | The Core's orbit ring was clipped at 768 while ~290px of the fold sat empty, and the whole intro overflowed the fold at 1280 and 1024 | Core height driven by viewport **height**, with a taller tablet value |

## Final Visual QA

Four viewports inspected by eye, chapter by chapter, on 2026-09-24. Chapters
were located by scrolling their heading into view — never by a fixed scroll
offset, which on a sticky-stage page lands between chapters and looks exactly
like a missing asset.

Each viewport was checked for: intro, chapters 01–07, chapter transitions,
parallax, character visibility and composition, typography, category title,
chapter rail, CTA, header, footer, atmosphere and haze, foreground, clipping,
overflow, masking, text wrapping and contrast.

| Viewport | Visual QA | Issues | Fix |
|---|---|---|---|
| 1280×800 | **FIXED** | Intro scroll cue fell below the fold once the statement was restored; characters dropped out mid-scroll (layer promotion) | Core sized by viewport height; `will-change` removed from chapter layers |
| 1024×768 | **FIXED** | "Enter the universe" **never rendered** — it sat inside the reveal observer's negative `rootMargin` on a short fold; scroll cue then collided with it | `Reveal` gained `immediate` for above-the-fold content; cue moved into flow; Core sized by viewport height |
| 768×1024 | **FIXED** | Core's orbit ring clipped left and right while ~290px of the fold sat empty | Tablet-specific Core height; ring is now whole |
| 375×812 | **FIXED** | Characters 03–06 invisible when reached by scrolling, though present, decoded, correctly sized and topmost in the paint order | `will-change: transform` removed from `.plate` and `.figure` |

### Re-checks of previously fixed defects

| Defect | 1280 | 1024 | 768 | 375 |
|---|---|---|---|---|
| Character missing on mobile | pass | pass | pass | **was failing — now pass** |
| `"TV Shows"` missing its space | pass | pass | pass | pass |
| Chapter rail contrast | pass | pass | pass | rail hidden by design |
| Seam between chapters | pass | pass | pass | pass |
| Intro below the fold | **fixed** | **fixed** | pass | pass |
| Cue overlapping the statement | pass | **fixed** | pass | pass |
| Header cropping a character | pass | pass | pass | pass |
| Rail overlapping the right column | pass | pass | pass | n/a |
| Atmosphere bleeding over the footer | pass | pass | pass | pass |
| Final CTA still card-shaped | pass | pass | pass | pass |

Measured, not eyeballed: figure-region mean brightness and standard deviation
were sampled for all 28 chapter/viewport combinations. Before the fix, 375's
chapters 03–06 read 19–29 mean against 46–57 for the rest; afterwards they
read 48–59, in line with every other chapter and viewport.

**axe-core:** zero serious or critical violations at all four viewports,
scanned separately at the intro, each of the seven chapters, and the final
CTA. This covers the two contrast risks that could not be judged by eye —
body copy overlapping a character at 768, and the rail sitting over artwork
at 1024 and 1280.

### The layer-promotion defect

The most serious finding of this pass, and worth stating plainly because it
defeats every automated check this project has:

`will-change: transform` on `.plate` and `.figure` promoted **fourteen**
permanent composited layers, on top of seven sticky stages and a
full-viewport canvas. Under that pressure Chromium stopped rasterising some
of them. The affected element kept its geometry, its `opacity`, its decoded
image (`naturalWidth` 800) and its position at the top of
`elementsFromPoint` — and painted nothing.

No console error, no 404, no failed assertion, no wrong measurement. It was
found by sampling pixels, and confirmed by toggling `will-change` to `auto`
live in the browser and watching the character reappear (region mean 29 → 59).

`will-change` is a hint, not a requirement. The transforms here are
scroll-driven and perform identically without it.

## 14. Remaining Issues

1. **The attribution TODO in §5 is still open.** Not blocking, because no
   Kage asset ships — but whether anything needs crediting should be settled
   before deploy.
2. **The six superseded landing sections remain on disk**, unreferenced.
3. **`dist/` still carries ~85 MB of master PNGs** that no page requests —
   the pre-existing trade-off recorded in `LANDING_STATUS.md`, unchanged here.
4. **The Fandom Core chunk is 912 kB** (three.js), lazy-loaded, untouched.

## 15. Verification

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm run test` | 142 / 142 |
| `npx playwright test` | 717 passed, 0 failed |
| `npm run build` | clean |
| Landing image transfer | ~1.0 MB |
| Console errors / 404s | none at 1440x900 and 390x844 |
| `<h1>` count / heading skips | 1 / none |
| Horizontal overflow 320–1600px | none |

## 15b. Follow-on: the Kage engine adaptation

After this audit the Director extracted the Kage source into the repository
(`docs/THREEUI_KAGE_INTEGRATION_AUDIT.md` §14) and then adapted it directly:
`public/landing-pages/fandomverse-kage.html`, the authored Kage engine running
FandomVerse's seven worlds. That work — architecture, the twelve
substitutions, eight visual defects and the six-viewport QA — is recorded in
[FANDOMVERSE_KAGE_LANDING_WORKLOG.md](FANDOMVERSE_KAGE_LANDING_WORKLOG.md).

It does not supersede the React landing on `/`, which this document describes
and which remains in place.

## 16. Final Handoff

Not committed, per instruction. The maintained handoff set is
`docs/LANDING_STATUS.md`, `docs/TEAM_HANDOFF.md`,
`docs/UI_INTEGRATION_CONTRACT.md` and `docs/TEST_CHECKLIST.md`.
