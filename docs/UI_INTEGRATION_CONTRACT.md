# UI Integration Contract

What the landing sections expect from the rest of the app, and what the rest of
the app may assume about them. Break one of these and something else breaks.

## 1. Route registry

`src/routes/categoryRoutes.ts` (`CATEGORY_ROUTES`) is the **only** registry of
category routes. `CategoryExplorer` iterates it; it does not hold its own list.

Adding a category means adding it to `categories.json` **and** `CATEGORY_ROUTES`
**and** giving it key art in `landingAssets.ts`. Miss the third and the card
renders with a broken image, which `e2e/landing.spec.ts` will fail on.

## 2. Routing — HashRouter

The app runs on `createHashRouter`. Two rules, both from D-032:

- Never write a raw `#fragment` (no anchor links, no `scrollIntoView` via hash).
  Use `element.focus()` / `scrollIntoView()` on a ref or id, as the skip-intro
  control does.
- Never read `window.location.search`. Query state comes from `useSearchParams`.

Links use `<Link to="/path">`, which renders as `href="#/path"`. Tests that
assert on hrefs must expect the `#/` prefix.

## 3. Artwork

All landing artwork resolves through `src/data/landingAssets.ts`. No section
builds an asset path itself.

```
CATEGORY_HERO_ART[categoryId]       // 800px  — category cards
CATEGORY_HERO_ART_WIDE[categoryId]  // 1920px — full-bleed backdrops
portraitFor(characterId, fallback)  // 800px  — character portraits
LANDING_HERO_ART                    // the hero backdrop
```

`portraitFor` always returns something: a character without Batch 01 art falls
back to the procedural SVG the dataset already carries.

**Renditions, not masters.** The runtime serves `public/assets/gemini/web/`.
After any change to the masters, re-run:

```
python scripts/build-web-assets.py
```

The masters in `public/assets/gemini/` and the frozen staging copy in
`_gemini_batch_01/` are read-only. Set `USE_MASTERS = true` to serve them
directly — useful for judging compression, not for shipping.

## 3b. Chapter progress

The landing's motion is driven by custom properties published by
`useChapterProgress`, not by component state:

| Property | Set on | Meaning |
|---|---|---|
| `--chapter-progress` | the landing stage | Fractional chapter index, updated every animation frame |
| `--chapter-index` | the landing stage | The rounded chapter, for coarse switches |
| `--header-h` | `documentElement` | Measured height of the sticky site header |
| `--viewport-w` | `documentElement` | `documentElement.clientWidth`, for full-bleed break-out |

Rules:

- **Never read `--chapter-progress` from JavaScript per frame.** Derive what
  you need in CSS from `--local`, or read `progressRef.current` inside a draw
  loop. Putting it in state re-renders the page at 60fps.
- **A chapter must declare `--chapter-i`** and register its element, or its
  anchor is `0` and every chapter after it shifts.
- **No `overflow` on an ancestor of the chapters.** The stages are sticky.
- **Use `--viewport-w`, not `100vw`**, for anything full-bleed on this page.

## 4. Sections

Every section in `src/sections/` is self-contained: it reads what it needs from
`src/data` and renders. The one exception is `FeaturedStories`, which takes
`articles` as a prop so the page controls what is featured.

Sections render their heading group inside a semantic `<header>` element. That
means **`page.locator('header')` is ambiguous on any page with sections** — the
site header is the one outside a `<section>`:

```ts
page.locator('header:not(section header)')
```

Prefer this over `getByRole('banner')` in tests that run with the nav drawer
open: the drawer is `aria-modal`, which takes the banner out of the a11y tree.

## 5. Motion

No animation library. CSS transitions and keyframes, plus `IntersectionObserver`
via `useScrollReveal`. Three rules:

- Animate **opacity and transform only**. Nothing else is cheap enough.
- **Never fade text in from `opacity: 0`** if it must meet WCAG AA. It is below
  the minimum for the whole ramp (D-054). Move it instead.
- Every animation has a `prefers-reduced-motion: reduce` counterpart. The
  reduced-motion block must preserve any transform that is doing **framing**
  work rather than motion work — for example the portrait crop scale.

Motion tokens live in `src/styles/tokens.css`:
`--easing-decelerate`, `--duration-cinematic`, `--duration-ambient`. All three
are zeroed in the reduced-motion block.

## 5b. Masks

Feathering artwork into a composition is done with `mask-image`. One rule,
learned the hard way:

**Give each element exactly one mask layer. Never use `mask-composite`.**

Stacking two gradients on one element requires `mask-composite`, and its
legacy `-webkit-mask-composite` form takes different keywords. With a single
layer, `-webkit-mask-composite: source-in` intersects that layer with an empty
accumulated mask and paints *nothing*. This erased every character on phones
while the element still reported the right size, opacity, `naturalWidth` and
paint order — nothing automated could see it.

When a composition needs feathering on two axes, split it across two elements:
the wrapper takes one axis, the image the other.

## 6. Breakpoints

Canonical, and the only ones used: mobile ≤ 599, tablet 600–1023,
desktop 1024–1439, wide ≥ 1440.

## 7. Accessibility floor

- Exactly one `<h1>` per route. On the landing page it belongs to
  `CinematicEntry`.
- No skipped heading levels.
- Every `<img>` has an `alt`. Decorative art is `alt=""` inside an
  `aria-hidden="true"` wrapper.
- Two links on the same page must not share an accessible name **and** a
  destination — a screen reader's link list cannot tell them apart. This is why
  the final CTA reads "Start with Anime" rather than repeating the hero's
  "Enter the universe", and why chapter CTAs are named for the franchise
  ("Enter Starlit Ronin") rather than "Explore {Category}", which the Fandom
  Core already owns for all seven (D-061).
- **Compute contrast when dimming text with opacity.** Opacity multiplies
  through the token colour. `--color-text-muted` on `--color-bg` is 8.89:1, so
  `opacity: 0.55` lands at 3.41:1 — below AA. Two shipped failures came from
  exactly this.
- The chapter rail is a `<nav>` of `<button>`s with `aria-current`, not
  anchors: a real `href="#chapter"` corrupts the hash router (D-032).

## 8. Budgets

| Budget | Limit | Enforced by |
|---|---|---|
| Landing image transfer | 4 MB | `e2e/landing.spec.ts` |
| Horizontal overflow | none, 320–1600 px | `e2e/landing.spec.ts`, `e2e/responsive.spec.ts` |
| Console errors | none | `e2e/landing.spec.ts`, `e2e/console-audit.spec.ts` |
