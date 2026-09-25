# ThreeUI `KageLandingPage` — Integration Audit

**Date:** 2026-09-24 · **Branch:** `master`

**Status:** audit complete; the Director then chose to **extract the source
and assets into the repository**. See §14 for what was taken and where it
sits. The audit below is unchanged and still describes the package as
installed.

Everything below was read out of the installed package on disk. Nothing is
inferred from the website, the catalogue, or the package description.

---

## 1. Installed package / version

```
@designcodeio/threeui@1.2.0
```

| Field | Value |
|---|---|
| License | **MIT** |
| Publisher | `mengto` — the same owner as `MengTo/kage` and `threeui.com` |
| Repository | `github.com/MengTo/threeui` |
| Published | ~3 weeks before this audit |
| Unpacked size | **54.7 MB** (309 component files; the whole catalogue ships together) |
| Peer dependencies | `react >=18 <20`, `react-dom >=18 <20`, `three >=0.149 <1` |
| Dependencies | `three128: npm:three@0.128.0`, `three165: npm:three@0.165.0` |
| `sideEffects` | `["**/*.css"]` |

Installed with `npm install @designcodeio/threeui`. **No CLI was installed** —
neither `threeui-cli` nor `@designcodeio/threeui-cli`.

**Compatibility with this repo:** React 19.2 satisfies `>=18 <20`; `three@0.186`
satisfies `>=0.149 <1`. Both peers are already met — no version conflict.

The two aliased Three.js copies (0.128 and 0.165) are for *other* components in
the catalogue. **`KageLandingPage` imports neither**, nor `three` itself.

### Licensing note

This materially changes the position recorded in
[KAGE_FANDOMVERSE_INTEGRATION.md](KAGE_FANDOMVERSE_INTEGRATION.md) §5. The Kage
*repository* states "No license is currently granted for reuse or
redistribution of the original Kage code or artwork". This **package**, from
the same owner, ships the identical files under **MIT**. Redistribution and
modification of the packaged copy are therefore permitted under MIT terms,
with the customary notice retained. The §5 attribution TODO still stands for
anything sourced from the repository rather than the package.

---

## 2. `KageLandingPage` export

Two import paths, both valid under the package's `exports` map:

```ts
import { KageLandingPage } from '@designcodeio/threeui'
import { KageLandingPage } from '@designcodeio/threeui/components/KageLandingPage'
```

`lib-dist/index.d.ts:53` re-exports it; `package-components/KageLandingPage.js`
is a four-line re-export of the real implementation.

`LandingPageFrame`, `KAGE_TYPOGRAPHY`, `postPageCustomization` and
`PAGE_CUSTOMIZATION_BRIDGE` all exist in the source but are **not reachable**:
the `exports` map exposes only `.`, `./style.css`, `./components/*`,
`./assets/*` and `./package.json`, and `components/KageLandingPage` re-exports
only the one symbol.

---

## 3. Actual implementation location

```
lib-dist/shaders/landing-pages/LandingPages.js      ← the component
lib-dist/shaders/landing-pages/pageTypography.js    ← the customization bridge
lib-dist/shaders/landing-pages/pageRecipes.js       ← KAGE_TYPOGRAPHY recipe
lib-dist/assets/landing-pages/kage.html             ← the authored Kage page
lib-dist/assets/landing-pages/secret-pathways-assets/…  ← its assets
lib-dist/style.css                                  ← .threeui-background sizing
```

`KageLandingPage` is, in full:

```js
function KageLandingPage(props) {
  return <RecipeFrame {...props}
    recipe={KAGE_TYPOGRAPHY}
    title="Kage — Where stillness reveals the unseen"
    sourceUrl="/landing-pages/kage.html" />
}
```

and `LandingPageFrame` renders:

```jsx
<div className="threeui-background landing-page-frame" data-state={ready ? 'ready' : 'loading'}
     style={{ position:'relative', overflow:'hidden', background:'#080808', pointerEvents:'auto' }}>
  <iframe title={title} src={sourceUrl} loading="eager"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:0 }} />
</div>
```

### The finding that decides this audit

**`KageLandingPage` is an `<iframe>`.** It is a preservation viewer: it points
a sandboxed frame at a self-contained HTML document and then reaches into that
document's `<head>` to append a typography stylesheet.

The brief for this phase states *"Không muốn iframe"*. The package offers no
other delivery mechanism — there is no DOM-level, React-level or renderer-level
Kage component anywhere in it.

---

## 4. Actual Three.js architecture

| Question | Answer |
|---|---|
| Does the component create a WebGL renderer? | **No** — not in the host document. |
| Does it create a canvas? | **No** — not in the host document. |
| Does it use React Three Fiber? | **No.** |
| Does it import `three`? | **No.** |
| Which Three.js runs? | **r149**, vendored *inside* the framed document as `secret-pathways-assets/three.min.js` (608 KB), loaded by a plain `<script>` tag. |

All of Kage's scene, camera, fog, lighting, particles and post-processing run
inside the iframe's own JavaScript context, exactly as they do when the page is
opened standalone. The host React tree contributes a `<div>` and an `<iframe>`.

**Consequence:** the app's own `three@0.186` and the frame's r149 coexist
without conflicting — different documents, different contexts. But they are
also two complete 3D runtimes, and if FandomVerse's Fandom Core is kept on the
same route, **two live WebGL contexts** are on screen at once.

---

## 5. Asset architecture

`sourceUrl` is the **root-relative** path `/landing-pages/kage.html`, and
`kage.html` references its assets **relatively** (`secret-pathways-assets/…`).
The host application must therefore serve:

```
public/landing-pages/kage.html                        244 KB
public/landing-pages/secret-pathways-assets/          3.2 MB
    three.min.js                                      608 KB
    fonts.css                                          99 KB  (base64 WOFF2, no remote fonts)
    generated/*.webp                     4 files      100–196 KB each
    foreground/png/*.webp               10 files       84–344 KB each
```

The package ships all of it under `lib-dist/assets/landing-pages/`, reachable
through the `./assets/*` export, so a build step or a copy can place it in
`public/`. Nothing is fetched from a CDN at runtime.

**Two path risks:**

- `vite.config.ts` sets no `base`, so it defaults to `/` and the root-relative
  `sourceUrl` resolves. **Deploying under a subpath would break it**, and
  `KageLandingPage` does not accept a `sourceUrl` override.
- These files would be **outside** the landing image budget enforced by
  `e2e/landing.spec.ts`: that test counts responses to the parent document, and
  iframe subresources are not counted. A ~3.9 MB payload would ship unmeasured.

---

## 6. Props / API

```ts
type LandingPageProps = { className?: string; srcDoc?: string; style?: CSSProperties }
type PageTypographyProps = {
  headingFont?: string; bodyFont?: string
  headingWeight?: string; bodyWeight?: string
  primaryColor?: string
  headingSize?: number; bodySize?: number; headingLetterSpacing?: number
}

KageLandingPage(props: LandingPageProps & PageTypographyProps)
```

That is the **entire** surface. `sourceUrl`, `title` and `customization` are
omitted by the type and hard-coded by the component.

Customization works by `applyPageCustomization(frameEl, { css, fontHref })`,
which appends a `<style>` to the framed document's head on every update. The
package's own comment states the intent plainly: *"the packaged HTML file
itself remains byte-exact."* `KAGE_TYPOGRAPHY` is a pure CSS recipe — it
retones `--vermilion` from `#e0231c` and scales `.h-hero`, nothing more.

### There is no content API

No prop accepts a heading, a body string, a chapter list, a link, an image, a
CTA, or a navigation handler. The framed document is Kage's five chapters about
a Kyoto mountain temple, in its own words, and the only levers are eight
typography and colour values.

**`srcDoc` is the one escape hatch.** `LandingPageFrame` prefers it over
`sourceUrl` (`srcDoc ? {srcDoc} : {src}`), and it survives into
`LandingPageProps`. Supplying a modified Kage document is therefore possible —
see §12, option B. Note the package's own comment that srcDoc frames are
treated as opaque, so the typography props are unlikely to apply to one, and
`PAGE_CUSTOMIZATION_BRIDGE` (which would fix that) is not exported.

---

## 7. Fidelity versus the original Kage

**100%. It is the same file.**

Verified against the `MengTo/kage` clone audited in the previous phase:

| File | Repo | Package | Result |
|---|---|---|---|
| `kage.html` vs `index.html` | 4,821 lines / 248,784 B | 4,821 lines / 243,963 B | **0 differing lines** after normalising line endings. The 4,821-byte delta is exactly one byte per line — CRLF vs LF. |
| `three.min.js` | 608,087 B | 608,081 B | 6 bytes, line endings |
| `fonts.css` | 99,363 B | 99,356 B | 7 bytes, line endings |
| `generated/kage-moonwater.webp` | 102,234 B | 102,234 B | **byte-identical** |
| `foreground/png/sakura-branch.webp` | 252,528 B | 252,528 B | **byte-identical** |

Every item the brief asked about is therefore present and authentic, because
none of it was reimplemented:

| Aspect | Status |
|---|---|
| Scene, camera, scroll choreography | authored original |
| Pointer interaction, custom cursor | authored original |
| Keyboard / anchor navigation | authored original, **scoped to the frame** |
| Particles, fog, atmosphere, post-processing | authored original |
| Foreground cutout staging | authored original |
| Typography and word-level reveals | authored original |
| Responsive behaviour | authored original |
| Reduced motion | authored original |
| Resize and WebGL lifecycle | authored original |

The package is an excellent way to **show Kage**. That is what it was built for.

---

## 8. Compatibility with the current FandomVerse landing

Current landing (unchanged by this audit): `HomePage.tsx` composes
`ChapterIntro` (wrapping `CinematicEntry` / the WebGL Fandom Core),
`ChapterIndex`, seven `CategoryChapter`s, `UniverseStatement` and `FinalCta`,
driven by `useChapterProgress`. Data: 7 categories, 35 characters, 14 approved
Gemini assets served as ~1.0 MB of WebP renditions.

| Concern | Effect of putting `KageLandingPage` on `/` |
|---|---|
| **Content** | None of FandomVerse's content can appear. No categories, no characters, no franchise names, no taglines. The visitor reads about a Kyoto temple. |
| **Routing** | Links inside the frame drive the frame. Nothing in it can reach `react-router`, so **all seven category hubs become unreachable from the landing**. The frame's internal `href="#gate"` anchors do *not* touch the parent hash, so D-032 is not triggered — but neither is any navigation. |
| **Document structure** | The framed document has its own `<h1>`, landmarks and focus order. The parent route would have **no `<h1>`** and no content in `<main>`. |
| **Skip-intro contract** | `#fandom-categories-section` would not exist. |
| **Existing tests** | Assertions bound to landing DOM: `e2e/fandom-core.spec.ts` (21), `e2e/landing.spec.ts` (16), `e2e/navigation.spec.ts` (11), `src/app/RouteTransitions.test.tsx` (9), `src/app/App.test.tsx` (7), plus `CinematicEntry.test.tsx` and `FandomCoreFallback.test.tsx`. **All of these fail**, and none could be made to pass without deleting the guarantees they encode. |
| **Header / search / auth / cart / chatbot** | Unaffected — they live in `RootLayout`, outside the route. The frame would sit under the sticky header. |
| **Accessibility** | axe cannot reach into a cross-document frame; the current per-chapter AA verification would no longer apply to landing content. |
| **WebGL** | Two live contexts if the Fandom Core stays on the page. |

---

## 9. Required changes for a direct integration

1. `npm install @designcodeio/threeui` — **done** (`package.json`, `package-lock.json` modified; nothing else).
2. Copy `lib-dist/assets/landing-pages/kage.html` and `secret-pathways-assets/` into `public/landing-pages/` (~3.9 MB), or add a build step that does.
3. Import `@designcodeio/threeui/style.css` for `.threeui-background` sizing.
4. Give the frame an explicit height — it fills its parent, which must be sized.
5. Replace `HomePage`'s body with `<KageLandingPage />`.
6. Delete or rewrite ~64 assertions across seven test files.
7. Accept that the landing carries no FandomVerse content.

Steps 6 and 7 are not adjustments; they are the abandonment of the landing's purpose.

---

## 10. Risks

| # | Risk | Severity |
|---|---|---|
| 1 | **No content API.** The stated goal ("Kage experience + FandomVerse branding/content") cannot be met with the public API. Only eight typography/colour values are adjustable. | **Blocking** |
| 2 | **It is an iframe**, which the brief rules out. | **Blocking** |
| 3 | **Seven category hubs unreachable** from the landing; the site's primary entry point stops being an entry point. | **Blocking** |
| 4 | ~64 assertions across seven files fail, including the accessibility and content-honesty gates. | High |
| 5 | Root-relative `sourceUrl` with no override — breaks under a subpath deploy. | Medium |
| 6 | Two WebGL contexts if the Fandom Core is kept. | Medium |
| 7 | `sandbox="allow-same-origin allow-scripts"` on a same-origin document is effectively no sandbox; the framed script can reach `window.parent`. First-party content, so acceptable — but it is not the protection the attribute implies. | Low |
| 8 | 54.7 MB in `node_modules` for one component. Build output is unaffected (the component is ~40 lines), but installs and CI caches grow. | Low |

---

## 11. Performance implications

- **Parent bundle: negligible.** `KageLandingPage` compiles to a div and an iframe; it pulls in no Three.js.
- **Runtime: a second full page.** ~3.9 MB of iframe subresources — 608 KB Three.js, 99 KB embedded fonts, ~2.2 MB of WebP plates and cutouts — plus a second document, a second JS context and a live WebGL renderer.
- **Not covered by the existing budget test**, which only counts parent-document responses.
- Compare: the current landing transfers **~1.0 MB** and is budget-enforced at 4 MB.
- With the Fandom Core retained, the route would run **two** WebGL contexts and two animation loops. The previous phase already found that layer/compositor pressure on this page can silently stop Chromium rasterising layers (D-062).

---

## 12. Recommended integration

### What the package is good for, as-is

Showing Kage **on its own route** — e.g. `/kage` as a credited showcase — is a
clean, low-risk, fully-faithful use of it, and needs only §9 steps 1–4. It
touches no existing test and no existing content.

### The only route to "Kage experience + FandomVerse content"

`srcDoc` accepts an arbitrary document. Under MIT, `kage.html` may be copied
and modified. So:

1. Copy `kage.html` into the repo as a first-party, MIT-attributed file.
2. Edit **its content** — the five chapters become seven, the copy becomes
   FandomVerse's, the plates become the approved Gemini art. The scene, camera,
   scroll choreography, particles and atmosphere code are left untouched, which
   is exactly what preserves fidelity.
3. Render it through `KageLandingPage` via `srcDoc`, or simply serve it
   directly — at which point the package is no longer doing anything the host
   could not do with an `<iframe>` of its own.

Honest accounting of that route: it is still an iframe; category links still
cannot drive the parent router without a `postMessage` bridge written by hand;
the parent route still has no `<h1>`; the typography props stop working on an
opaque `srcDoc`; and maintaining a 4,821-line hand-edited HTML file sits
outside the React/TypeScript/test discipline the rest of this project runs on.

---

## 13. Rollback strategy

Nothing has been integrated, so rollback today is one command:

```
npm uninstall @designcodeio/threeui
```

`package.json` and `package-lock.json` are the only files this audit modified.
No source file, test, asset or document was changed.

Were an integration to proceed later, it would be reversible as long as it is
kept behind a route or a flag: the current `HomePage` and all of
`src/sections/` and `src/features/landing/` remain in place, so reverting means
restoring the route's element and deleting `public/landing-pages/`.

---

## RECOMMENDATION

### **D — Package unsuitable for the stated goal.**

Not because it is low quality — it is the opposite. `KageLandingPage` is a
100% faithful, MIT-licensed, byte-exact preservation of the authored Kage,
verified file by file against the original. It does its job perfectly.

Its job is **displaying Kage**. It is a preservation viewer built around a
sandboxed iframe, with a deliberate contract — stated in its own source — that
*"the packaged HTML file itself remains byte-exact"*. It exposes eight
typography and colour props and **no content API at all**.

The goal set for this phase is "Kage experience + FandomVerse branding/content"
with an explicit "không muốn iframe". The package delivers Kage's content, in
an iframe, and provides no mechanism to substitute FandomVerse's seven
categories, 35 characters, hub links or CTAs. Adopting it on `/` would make the
site's main entry point a page about a Kyoto temple with no route into
FandomVerse, and would fail roughly 64 assertions across seven test files.

**If the Director wants Kage itself visible in FandomVerse**, option **A/C on a
dedicated route** (`/kage`) is genuinely attractive: full fidelity, MIT-clean,
~40 lines of integration, no test touched. That is a real and good use of this
package, and it can sit alongside the existing landing rather than replacing it.

**If the goal remains a FandomVerse landing that feels like Kage**, the package
cannot provide it, and the existing implementation — which ports Kage's
interaction architecture natively (D-057…D-064) and carries FandomVerse's own
content, routing, accessibility and tests — remains the only approach that
satisfies both halves of the requirement.

---

## 14. Extraction (what was actually done)

The Director elected to take the source rather than consume the package
component, which avoids the iframe the package's own API forces.

### What was extracted

```
public/landing-pages/
  kage.html                     238 KB   the authored experience, 4,822 lines
  secret-pathways-assets/      3196 KB   fonts, vendored three.js r149, artwork
  ATTRIBUTION.txt                        MIT notice — must ship with the files
```

Copied by **`scripts/sync-kage.mjs`**, which is re-runnable and idempotent: it
clears the destination first, so a file removed upstream does not linger here.
Run it again after upgrading the package.

### Verified working

Served from the production build at `/landing-pages/kage.html` and driven in a
real browser at 1440×900:

| Check | Result |
|---|---|
| WebGL context | **live**, canvas 1440×900 |
| `[data-cam]` sections | 6 (five chapters + footer) |
| Document title / `<h1>` | "Kage — Where stillness reveals the unseen" / "Where stillness reveals the unseen." |
| Page height | 5,452 px |
| Console errors | **none** |
| Failed requests | **none** |
| Build output | present in `dist/landing-pages/` |

The scene renders in full: the temple, the vermilion moon, the torii, the 3D
`KAGE` wordmark, drifting maple, grass foreground, chapter chips and the
vertical Japanese display type.

### What this does and does not change

- **Nothing about the FandomVerse landing.** `/` is untouched. No route, no
  navigation entry and no test references the extracted page; it is reachable
  by its URL only.
- **`dist/` grows by ~3.4 MB.** No FandomVerse route requests any of it, so
  the landing's measured ~1.0 MB transfer and its 4 MB budget test are
  unaffected.
- **Licensing is now recorded**, in `docs/08_LICENSES.md` §3b. These are the
  first third-party files in the repository; the register there keeps them
  separate from the 161 original procedural assets and states the standing
  conditions.

### Verification after extraction

lint clean · typecheck clean · **142/142** Vitest · **720 passed / 0 failed**
Playwright · build clean. (One webkit flake on the landing image-budget test
under full-suite load; 3/3 passes in isolation and the extraction adds nothing
to `/`.)

### If the page is to become the landing

The audit's conclusion stands: `kage.html` is a complete, self-contained
document about a Kyoto temple. Putting it on `/` still means no FandomVerse
content, no route into the seven hubs, no `<h1>` on the React route, and ~64
failing assertions — unless its **content** is adapted, which MIT permits and
which is now possible because the source is in the repository rather than
behind a package boundary. That adaptation is a separate, substantial piece of
work: 4,822 lines of hand-authored HTML, CSS and JavaScript, outside the
React/TypeScript/test discipline the rest of the project runs on.

### Rollback

```
rm -rf public/landing-pages scripts/sync-kage.mjs
npm uninstall @designcodeio/threeui
```
and revert the §3b block in `docs/08_LICENSES.md`. Nothing else references any
of it.
