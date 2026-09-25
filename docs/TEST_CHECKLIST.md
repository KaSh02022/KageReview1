# Test Checklist

## Running

```
npm run lint          # eslint
npm run typecheck     # tsc -b --noEmit
npm run test          # vitest, 142 tests
npm run build         # tsc -b && vite build
npx playwright test   # 724 tests across chromium / firefox / webkit / mobile-chrome
```

**Run Playwright alone.** A second preview server on port 4173 causes mass
connection-refused failures that look like product bugs and are not. If a run
reports hundreds of failures, check for an orphaned preview server first.

Expected on a clean tree: **721 passed, 0 failed, 3 skipped.**

## Landing suite — `e2e/landing.spec.ts`

| Test | Guards against |
|---|---|
| renders every chapter exactly once | A chapter silently disappearing, or being rendered twice. |
| keeps the document outline free of skipped heading levels | `h2 → h4` regressions as chapters are reordered. |
| the contents page lists all seven fandom hubs | A category dropping out of `CATEGORY_ROUTES`, and the skip-intro target losing its links. |
| every chapter offers a way into its world | A chapter losing its CTA; also catches duplicate accessible names against the Fandom Core's seven. |
| the chapter rail is operable from the keyboard | The rail regressing to hover-only, or `aria-current` not tracking. |
| every image decodes — no silently blank art | An asset path that 404s or resolves to something undecodable. This fails *silently* in review: a dark composition with no plate just looks moody. |
| stays within the landing image budget | Serving the multi-megabyte masters again (D-052, D-056). |
| reaches the end of the page without console errors | Errors that only fire on scroll-reveal or lazy mount. |
| does not overflow horizontally on a small phone | 320 px overflow. |
| keeps every chapter readable under reduced motion | Reduced motion removing content rather than movement — and word-reveal `aria-label`s drifting from rendered text. |

### `walkPage` — read before changing it

The helper that scrolls the page has three non-obvious requirements. All three
were found by tests failing, and removing any one makes the suite lie:

1. **Wait for the last section before measuring.** On a cold load the Fandom
   Core's lazy chunk has not mounted, so the page is a screen or two tall. A
   walk that measures first concludes it is already at the bottom and stops.
2. **Measure `document.documentElement.scrollHeight`, not `document.body`.**
   WebKit reports `body.scrollHeight` as `0` at this point, which turns the
   walk into a no-op and leaves nine lazy images never scrolled into view.
3. **Step from the test, not inside one `page.evaluate`.** WebKit only starts
   a lazy image once the page goes idle between scrolls.

Do not scroll back to the top at the end. WebKit abandons a lazy image that
leaves the viewport before it finished, leaving it permanently
`complete === false`.

## Locating a chapter for a screenshot

**Never screenshot by a fixed scroll offset.** Every chapter is a sticky stage
inside a taller section, so a fixed increment lands between two chapters and
produces a frame that looks exactly like a missing asset. Two separate QA
passes were misled by this.

Scroll the chapter's heading into view instead:

```ts
await page.getByRole('heading', { name: 'K-Pop', exact: true }).scrollIntoViewIfNeeded()
```

## The Kage adaptation page

`/landing-pages/fandomverse-kage.html` is a static page outside the SPA, so
none of the Vitest or Playwright suites cover it. Check it by hand after any
change to `scripts/build-fandomverse-kage.mjs` or after re-syncing Kage:

```
node scripts/sync-kage.mjs            # only after upgrading the package
node scripts/build-fandomverse-kage.mjs
npm run build
```

- [ ] `kage.html` is still byte-identical to the package copy — the generator
      must never write to it
- [ ] nine `[data-cam]` sections and nine rail dots
- [ ] the 3D wordmark reads FANDOMVERSE and is not clipped at either end
- [ ] one chapter to a screen — two chapters must never share the fold
- [ ] on a phone, the description **and** the CTA sit above the foreground band
- [ ] no console error, no failed request

**Locating a chapter here: scroll, do not jump.** Jumping to a heading skips
the IntersectionObserver that reveals that chapter's copy, so the screenshot
shows a heading with no body — which looks exactly like a rendering bug and is
not one. A fixed scroll offset is worse: it lands between chapters.

## Judging whether a character rendered

Do not trust the DOM, and do not trust your eyes on a dark composition. A
figure can report the right bounding box, `opacity`, `naturalWidth` and paint
order and still be painting nothing — see the `will-change` note in
TEAM_HANDOFF.md.

Sample the pixels:

```py
from PIL import Image, ImageStat
im = Image.open(shot).convert('L').crop(figure_box)
st = ImageStat.Stat(im)     # a rendered character lifts both mean and stddev
```

Across all 28 chapter/viewport combinations a healthy figure region reads
roughly 44–69 mean with a standard deviation above 27. A region in the
high-teens to twenties means the character is not being painted.

## Full-page screenshots — a known false alarm

`page.screenshot({ fullPage: true })` on this page renders **some image cards
blank**. It is a rasterisation artifact of capturing a tall page with many
large decoded bitmaps, not a product bug. Four portraits appeared blank in a
full-page capture while every one of them rendered correctly in a viewport
screenshot and reported `complete=true, naturalWidth=2048` in the browser.

**Verify any suspected missing image with a viewport screenshot** before
treating it as a defect.

## Manual visual QA

Not covered by assertions. Walk these at 1440, 1024, 768 and 375:

- [ ] **Chapters bleed into one another.** No hard horizontal line where a
      chapter meets the section above it — that is a cut, and this page is
      supposed to be continuous.
- [ ] **The lead stands *in* the world**, not on it. No visible rectangular
      edge on the portrait; the mask should feather on both axes.
- [ ] **The intro fits the fold**, including the statement and the scroll cue.
      It is sized to `100dvh − --header-h`, so a header that grows a row will
      break it.
- [ ] **The sticky header does not crop a lead's head** on a phone.
- [ ] **The chapter rail does not overlap** the right column of the contents
      page, the statement or the final CTA.
- [ ] **The atmosphere stops at the end of the landing** — no motes over the
      site footer.
- [ ] The rail's active entry tracks the chapter you are actually reading.
- [ ] With `prefers-reduced-motion: reduce`, nothing moves and nothing is
      missing: every chapter heading, CTA and the whole rail still work.
- [ ] **Every character is actually painted**, checked by scrolling down to
      each chapter rather than jumping to it — the layer-promotion failure
      only appears after a sequential scroll.
- [ ] **The intro fits the fold at 1024×768**, the shortest viewport in the
      matrix: statement *and* scroll cue both visible, not overlapping.

## Before committing landing changes

- [ ] `npm run lint` clean
- [ ] `npm run typecheck` clean
- [ ] `npm run test` 142/142
- [ ] `npx playwright test` 713 passed, 0 failed, 0 flaky
- [ ] `npm run build` succeeds
- [ ] No temporary spec files left in `e2e/` (screenshot or probe harnesses)
- [ ] If masters changed: `python scripts/build-web-assets.py` re-run
- [ ] If you dimmed any text with `opacity`, its contrast was computed
