# Team Handoff — Landing Page

For whoever picks this up next. Start here, then read
[LANDING_STATUS.md](LANDING_STATUS.md) for what exists and
[UI_INTEGRATION_CONTRACT.md](UI_INTEGRATION_CONTRACT.md) for the rules.

## What changed

The landing page is now a **cinematic chapter sequence** travelled by
scrolling — an intro, a contents page, seven category chapters, a closing
statement and a final CTA — replacing the previous hero / cards / grid / CTA
stack. The interaction architecture reinterprets the Kage cinematic scroll
experience; **none of Kage's code or artwork is used** (D-058, and
[KAGE_FANDOMVERSE_INTEGRATION.md](KAGE_FANDOMVERSE_INTEGRATION.md) for the
full audit). The Fandom Core WebGL entry was **not** touched — it is wrapped.

New:

```
src/features/landing/useChapterProgress.ts   scroll -> fractional chapter progress
src/features/landing/AtmosphereCanvas.tsx    the 2D environmental layer
src/features/landing/ChapterRail.tsx         01–07 position + navigation
src/features/landing/WordReveal.tsx          word-at-a-time heading reveal
src/features/landing/chapterAccents.ts       accents as r,g,b for the canvas
src/sections/ChapterIntro.tsx                chapter 00, wraps CinematicEntry
src/sections/ChapterIndex.tsx                the contents page
src/sections/CategoryChapter.tsx             one composed shot, x7
src/sections/UniverseStatement.tsx           the closing statement
```

Carried over unchanged from the previous phase: `src/components/Reveal/`,
`src/hooks/useScrollReveal.ts`, `src/hooks/useScrolled.ts`,
`src/data/landingAssets.ts`, `scripts/build-web-assets.py`, and the asset
folders.

Modified: `HomePage.tsx` + its CSS (rebuilt as chapter composition),
`FinalCta.module.css` (restyled to the editorial language),
`CinematicEntry.module.css` (height made overridable; defaults unchanged),
`tokens.css` (`--space-page-gutter`), `e2e/landing.spec.ts` (rewritten for
the chapter architecture).

## How the page moves — read this before changing any chapter CSS

`useChapterProgress` writes **one number** to the stage element once per
animation frame:

```
--chapter-progress   2.37  =  "37% of the way from chapter 2 into chapter 3"
```

Each chapter declares `--chapter-i` and derives `--local` from it, so a layer's
parallax is just `calc(var(--local) * <its depth>)`. Consequences worth knowing:

- **Nothing re-renders on scroll.** The damped value never enters React state.
  Only `activeIndex` does, and it changes about ten times per page.
- **Anchors are measured, not assumed.** Each chapter's anchor is the scroll
  position where its centre meets the viewport centre, so chapters of different
  heights occupy the same amount of *progress*.
- **Each chapter is a sticky stage in a taller section**, pinned below the
  measured header (`--header-h`). The shot holds while you travel through it.
  Do not put `overflow` on an ancestor — it breaks every sticky stage.
- **`--viewport-w`** is the document's `clientWidth`, published by the same
  hook. The landing uses it to break out of the app shell's centred container.
  `100vw` is the wrong tool: it includes the scrollbar and overflows.

## The three things most likely to trip you up

### 1. The runtime does not serve the approved masters

It serves derived WebP renditions. The masters are 5–8 MB each and the landing
shows fourteen of them: **the page measured 85.9 MB before this change, and
1.0 MB after** (D-052).

Nothing was generated, replaced, renamed or deleted — the masters are
byte-identical on disk and the frozen staging copy in `_gemini_batch_01/` was
never written to. Only what the browser downloads changed.

If you touch a master, re-run `python scripts/build-web-assets.py`.
To serve masters directly, set `USE_MASTERS = true` in `landingAssets.ts`.

### 2. A blank image card is not always a bug

Full-page screenshots of this page render some image cards blank. It is a
rasterisation artifact, not a product defect — four portraits looked blank in a
full-page capture and every one of them was fine in a viewport screenshot.

Confirm with a viewport screenshot before chasing it. `e2e/landing.spec.ts`
asserts on `naturalWidth`, which is the reliable signal.

### 3. Do not fade text in from `opacity: 0`

The hero entrance originally faded the Fandom Core in. That block holds the
page's only `<h1>` and the seven category labels, so during the animation they
sat at **4.38:1** — below the 4.5:1 WCAG AA minimum — and an axe run caught it
intermittently. Text fading from zero is always below AA on the way up.

The Core now animates transform only (D-054). Keep it that way.

## Test changes to existing specs

Three existing specs were adjusted. None had its assertion weakened; each was
made to target the right thing:

| Spec | Change | Why |
|---|---|---|
| `responsive.spec.ts` | `page.locator('header')` → `page.locator('header:not(section header)')` | Landing sections use semantic `<header>` for their heading groups, so the bare locator became ambiguous. `getByRole('banner')` does not work here either — the nav drawer is `aria-modal`, which removes the banner from the a11y tree exactly when this test needs to measure it. |
| `persistence.spec.ts` | `openFirstCardIn` now waits for the heading to change, not just the URL | The URL changes a beat before React swaps the `<h1>`, so the helper was handing callers the hub's own heading. Under load this made the cart assertion search for "Anime". |
| `accessibility.spec.ts` | unchanged — the *product* was fixed, twice | See D-054, and the rail-contrast fix below. |
| `landing.spec.ts` | rewritten for the chapter architecture | Ten tests, same guarantees as before plus keyboard rail operation and reduced-motion content parity. |

### A fourth thing: `will-change` is not free

`will-change: transform` on the chapter plates and figures promoted fourteen
permanent composited layers, on top of seven sticky stages and a full-viewport
canvas. Chromium responded by not rasterising some of them.

The failure mode is the nastiest this codebase has produced: the element kept
its bounding box, its computed opacity, its decoded image and its place at the
top of `elementsFromPoint`, and painted **nothing**. Characters simply were
not there when you scrolled to them on a phone. Nothing automated could see
it — it was found by sampling pixel brightness.

Use `will-change` only while something is actually animating, and release it
afterwards, the way `Reveal.module.css` and `WordReveal.module.css` do.

### A fifth thing: contrast and animation

Two separate WCAG AA failures were found by axe on this page, both real:

1. Fading the Fandom Core in from `opacity: 0` put its category labels at
   4.38:1 for the length of the animation (D-054). Text that fades from zero
   is *always* below AA on the way up — move it instead of fading it.
2. The chapter rail's numerals sat at 3.41:1 at `opacity: 0.55`. Opacity
   multiplies straight through the token colour, so dimming a muted colour
   compounds. Now 0.80, measured at 6.04:1.

When you dim text with opacity, compute the result. `--color-text-muted` on
`--color-bg` is 8.89:1, which leaves less headroom than it looks.

## The Kage cinematic page

There is a second, standalone landing at
`/landing-pages/fandomverse-kage.html`: the authored Kage WebGL experience with
FandomVerse's seven worlds in it. It is **generated** — never edit it by hand;
edit `scripts/build-fandomverse-kage.mjs` and regenerate. The original
`kage.html` beside it is third-party and must stay byte-identical.

Route `/` is untouched and still serves the React landing. Full detail, and the
reasoning for not switching `/`, is in
[FANDOMVERSE_KAGE_LANDING_WORKLOG.md](FANDOMVERSE_KAGE_LANDING_WORKLOG.md).

One transferable lesson from building it: **Kage's own CSS uses descendant
selectors at specificity (0,2,0)**, so a bare `.my-class` rule loses silently
— no error, no warning, the declaration simply does not apply. Scope against
`.sec > .my-class` when styling anything inside a Kage section.

## Open items

Not blockers, but the next person should know:

1. **`dist/` carries ~85 MB of PNGs no page requests.** The masters are kept in
   `public/` so `USE_MASTERS` stays a working switch, and because the asset
   freeze forbids deleting assets. Moving them out of `public/` is a one-line
   change that does not touch `_gemini_batch_01/` — **Director's call.**
2. **Article thumbnails are procedural SVGs.** They are styled as a muted tint
   band, which is honest, but real article art is a future batch.
3. **Three filenames differ from the manifest stems** and are reconciled by a
   mapping table (D-053). If the pipeline ever normalises the names, that table
   is the single place to update.
4. **`character-books-alex-chen.png` is unused** — there is no "books" category
   and no "Alex Chen" in the dataset. It is left in place, not deleted.
5. **The Fandom Core chunk is 912 kB** (three.js), lazy-loaded. Untouched by
   this work, still the largest thing the site can load.

## Verification at handoff

lint clean · typecheck clean · 142/142 Vitest · **721 passed, 0 failed, 0 flaky**
Playwright · production build succeeds · landing image transfer 1.0 MB ·
visual QA by eye at 1440×900, 1280×800, 1024×768, 768×1024, 390×844 and
375×812 · axe clean per chapter at four viewports.
