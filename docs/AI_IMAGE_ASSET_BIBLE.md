# AI Image Asset Bible (Phase 5B)

The visual specification for a later Gemini generation pass. **No image has been generated.** Nothing in `src/data/` points at a generated file. The 161 procedural SVGs shipped in Phase 5 remain the live assets and the permanent fallback.

Companion documents: `GEMINI_IMAGE_PROMPTS.md` (the prompts), `ASSET_MANIFEST.md` (the inventory), `ASSET_PROVENANCE.md` (the workflow), `AI_ASSET_REVIEW_CHECKLIST.md` (the gate).

---

## 1. Visual philosophy

> **One digital fandom universe containing seven distinct worlds.**

The failure mode to avoid is seven unrelated art styles stapled together behind one navbar. FandomVerse is a *portal* — the seven hubs must read as seven rooms in one building, not seven buildings.

So the visual system is deliberately lopsided: **almost everything is shared, and exactly one variable changes per category.**

| Layer | Varies by category? |
|---|---|
| Medium, finish, level of stylisation | No — identical everywhere |
| Lighting model (single coloured key/rim light + haze) | No — identical everywhere |
| Contrast, depth, grain, bloom, shadow behaviour | No — identical everywhere |
| Composition and negative-space discipline | No — identical everywhere |
| Background darkness and simplification | No — identical everywhere |
| Recurring universe motif | No — identical everywhere |
| **Accent hue, environment, materials, signature texture, mood** | **Yes — this is the only axis of difference** |

A viewer should be able to identify the category from a thumbnail by *colour and setting alone*, while never doubting the images came from the same production.

### Relationship to Kage

Kage is a technique reference only, and was already constrained this way in Phase 4 (D-031). Nothing in this bible derives from Kage's artwork, geometry, composition, branding, text, palette, or scene assets. The shared "single coloured rim light against near-black" language here is derived from **FandomVerse's own existing design tokens** — the dark surface palette and the seven accent tokens that have existed since Phase 2 — not from any external reference.

---

## 2. Global visual language

| Property | Specification |
|---|---|
| **Medium** | Stylised cinematic digital painting with a painterly concept-art finish. Roughly 70% stylised / 30% realistic. |
| **Level of realism** | Deliberately *not* photorealistic. Photoreal human faces invite accidental likeness to real people; flat vector wouldn't differ meaningfully from the SVGs it replaces. |
| **Lighting** | One dominant coloured key light in the category accent, placed as a rim or backlight, with soft volumetric haze and gentle bloom. This single rule does most of the work of making seven worlds feel related. |
| **Contrast** | High and cinematic. Dark overall key, bright accent core, shadows that retain detail rather than crushing to black. |
| **Saturation** | Restrained. The accent hue is the only strongly saturated element; everything else sits near-neutral. At most three hues in frame. |
| **Palette base** | Near-black desaturated blue, `#0b0e17`–`#10131f` — the same family as the app's `--color-bg` tokens, so art and UI sit on the same ground. |
| **Depth** | Explicit foreground / midground / background separation via atmospheric perspective and haze. |
| **Background** | Dark, simplified, low-detail. Two reasons: interface text stays legible over it, and the image still reads at 158px wide. |
| **Composition** | Centred or rule-of-thirds subject with generous negative space. Subject core inside the central 60% of frame. |
| **Texture** | Subtle fine film grain, soft bloom on light sources. No heavy noise, no visible brush chaos. |
| **Shadow** | Soft, directional, tinted with the accent hue. Never pure black. |
| **Typography relationship** | **No text is ever generated into an image.** All type is live DOM text rendered in the app's own fonts over or beside the image. This keeps type crisp, translatable, selectable, and accessible — and removes the single most common AI-image artefact. |
| **Recurring motif** | A faint nested-polygon core with a few drifting orbiting motes, sitting in the background haze. It echoes the Fandom Core's geometry as the universe's connective tissue, without reproducing it. |

---

## 3. The seven worlds

Each world inherits everything in §2 and changes only the five fields below. Accents are the existing Phase 2 `--color-accent-*` tokens — no new colours were invented for this.

| Category | Franchise | Accent | Environment | Materials | Signature | Mood |
|---|---|---|---|---|---|---|
| **Anime** | *Starlit Ronin* | ember rose `#ff5d73` | Wind-scoured ash plains, broken shrine gates, a dimming sky | Worn travel cloth, lacquered dark steel, drifting embers, frayed rope | Ember gradients and clean blade-light streaks | Wandering, resolute, quietly mournful |
| **Gaming** | *Ashfall Protocol* | signal cyan `#33d0ff` | Industrial exclusion zone, collapsed gantries, dead drop-ships | Matte armour plate, scuffed polymer, holographic glass, cabling | Faint HUD grid lines, signal-flare glow | Tense, tactical, under pressure |
| **Movies** | *Midnight Meridian* | amber spotlight `#ffb648` | Rain-slick neo-noir streets, arched underpasses | Wet asphalt, brass, damp wool overcoats, steam haze | Hard spotlight cones through rain, film-grain vignette | Suspicious, melancholy, unresolved |
| **TV Shows** | *The Glass Archive* | violet archive `#8f7bff` | Vast catalogued archive halls, racked glass fragments | Etched glass, brushed steel, archival paper, dust motes | Soft scanline banding, archive-glass caustics | Curious, secretive, slow-burning |
| **K-Pop** | *LUNARIS* | magenta bloom `#ff5de0` | Concert stage, bokeh ocean of crowd lights | Satin, sequin, chrome, polished stage floor | Blooming light shafts, sea of soft light points | Euphoric, polished, electric |
| **Comics** | *Ironclad Vanguard* | ink yellow `#ffe14d` | City rooftops, water-tower skylines at hard dusk | Enamelled armour, riveted steel, inked linework | Bold ink contour, visible halftone in shadow falloff | Heroic, weathered, defiant |
| **Manga** | *Paper Moon Requiem* | jade talisman `#5ce6a6` | Moonlit shrine grounds, paper-strung torii, still black water | Rice paper, ink wash, talisman slips, worn wood | Screentone-like monochrome broken by one accent hue | Haunted, tender, unresolved |

Every franchise above is original fiction created for this project in Phase 5 (D-037). None is based on, or may resemble, a real-world property.

---

## 4. Image classes

Dimensions are **derived from measured render sizes**, not chosen arbitrarily. Measurements taken with Playwright (chromium, DPR 1) on a populated Anime hub and its detail pages at 375 / 768 / 1440 / 1920 viewports.

### CLASS-HERO — category hub hero

| | |
|---|---|
| **Aspect** | 16:9 |
| **Master** | 2560×1440 |
| **Delivered** | 1920×1080, 1280×720, 640×360 |
| **Measured** | desktop **1392×280 (≈5:1)** · tablet 720×280 (≈2.6:1) · mobile **327×272 (≈1.2:1)** |
| **Used by** | 7 category heroes |

**This is the hardest class in the system.** The hero is a fixed-height band (280px desktop, 220px mobile) filled with `object-fit: cover`, so the *visible aspect ratio swings from about 5:1 to about 1.2:1* across viewports. A 16:9 source on desktop shows only the middle ~36% of its height; on mobile it shows the middle ~68% of its width.

> **Safe area:** all meaningful content inside the central **60% horizontally** and central **36% vertically**. Treat the top and bottom thirds as disposable atmosphere. No subject may depend on the frame edges.

### CLASS-CARD — everything shown in a card

| | |
|---|---|
| **Aspect** | 4:3 (native — `CardMedia` is `aspect-ratio: 4/3`, so there is **no crop**) |
| **Master** | 1600×1200 |
| **Delivered** | 1280×960, 640×480, 320×240 |
| **Measured** | featured card 638×479 · standard card 264×198–350×263 · dense card **158×118**–174×131 |
| **Used by** | gallery artwork (approved); article / trailer / release art (deferred) |

No cropping risk, but a severe **legibility** constraint: the same image renders at 638px and at 158px. It must survive an 4× downscale.

> **Safe area:** whole frame usable. But the subject must read as a silhouette at 158px — large forms, high contrast, no fine linework, no small detail carrying meaning.

### CLASS-PORTRAIT — character portraits

| | |
|---|---|
| **Aspect** | 1:1 |
| **Master** | 1024×1024 |
| **Delivered** | 1024×1024, 560×560, 320×320 |
| **Measured** | detail page **280×280 (1:1 at every viewport)** · hub card **158×118–172×129 (4:3 crop)** |
| **Used by** | 35 character portraits |

The one asset used at **two different aspect ratios**: square on the detail page, centre-cropped to 4:3 in the hub card.

> **Safe area:** the head and face must sit inside the central 4:3 band of the square, because the card crop discards roughly the top and bottom 12%. Head-and-shoulders framing; head slightly above centre but never in the top eighth.

### Classes evaluated and rejected

| Considered | Verdict |
|---|---|
| **Cinematic background / backdrop** (21:9) | **Not needed.** The only full-bleed backdrop in the app is the Fandom Core, which is WebGL and must stay procedural (Tier D). Adding a decorative backdrop would mean inventing a UI slot to justify an asset — backwards. |
| **Merchandise product shot** | **Not needed.** See §6 Tier A: photoreal product imagery for products that do not exist would be misleading. |
| **Portrait 2:3 / 3:4 "poster"** | **Rejected.** Nothing in the UI renders a tall image; a 2:3 asset would be centre-cropped to 4:3 and lose a third of its height. |

---

## 5. Responsive strategy

| Class | Desktop | Tablet | Mobile | Focal point | Text overlay |
|---|---|---|---|---|---|
| CLASS-HERO | 1392×280 band from the vertical centre | 720×280 | 327×272 near-square centre crop | Dead centre, both axes | **Yes** — the hub title, tagline and description sit over the lower portion behind a bottom-up dark gradient. Keep the lower third visually quiet. |
| CLASS-CARD | 264×198 (158×124 in dense grids) | 350×263 | 325×244 (158×118 dense) | Centre; whole frame visible | No overlay — all text sits below the image in the card body. |
| CLASS-PORTRAIT | 280×280 detail; 165×124 card crop | same | same | Face in the central 4:3 band | No overlay. |

**Delivery rules**

- Serve WebP with responsive `srcset`/`sizes` so a 158px card never downloads a 1280px master.
- Keep `loading="lazy"` on every content image (already the case in Phase 5).
- Compression targets carry over from `06_ASSET_BIBLE.md` §4: hero ≤300KB delivered, card ≤80KB delivered.
- Masters are archived outside the shipped bundle; only the delivered sizes are committed.
- Any generated asset must be measurably *better* than the SVG it replaces on both quality and weight, or it is rejected — an SVG averages ~1KB, so a 250KB hero has to earn its place.

---

## 6. Asset selection — the A/B/C/D classification

The instruction was explicitly *not* to generate one image per existing SVG. Of the 161 current assets, **70 are approved, 56 are deferred, and 35 are deliberately kept procedural.**

### Tier B — ENHANCE WITH GEMINI (70 approved)

| Type | Count | Why this is where generation pays off |
|---|---|---|
| Category hero | 7 | The single largest visual on every hub, and currently the weakest — a flat gradient band. Highest impact per asset in the entire system. |
| Character portrait | 35 | Character profiles are an SRS-mandated feature (FR-019). The current initials-avatars read as unmistakable placeholders; real portraits change the perceived quality of the whole product. |
| Gallery artwork | 28 | The gallery's *entire purpose* is images (SRS image-gallery requirement). A gallery of abstract gradient tiles is the least convincing screen in the app. |

### Tier C — OPTIONAL GEMINI ALTERNATIVE (56 deferred, not approved)

Article thumbnails (21), trailer thumbnails (14), release artwork (21). Catalogued so the cost of a complete pass is known, but **no prompts written**. Deferred because each sits beside text that already carries the meaning — an article card leads with its headline and summary, a release card with its title and status — so the art is supporting, not load-bearing. Worth revisiting after Tier B lands and its real quality is known.

### Tier A — KEEP PROCEDURAL (35, by decision)

| Type | Count | Why procedural is the *right* answer, not a compromise |
|---|---|---|
| Merchandise artwork | 14 | These depict products that do not exist. A photoreal mock-up of a hoodie nobody can buy edges toward misleading the user, on a page that already carries a "no real purchase" disclaimer. A clean flat garment/pin glyph is the honest representation. |
| Event visual | 21 | The information on an event card is the date, location, type and "Simulated fan event" badge — all live text. The art is decorative, and 21 generated images would be the largest spend in the system for the smallest gain. |

### Tier D — DO NOT REPLACE

- **The Fandom Core WebGL scene** — procedural Three.js geometry *is* the architecture (D-031/D-033). Swapping in generated imagery would break the progressive-enhancement contract and the reduced-motion / no-WebGL paths.
- **The Fandom Core 2D CSS fallback** — the guaranteed-available layer; it must never depend on a downloadable asset.
- **`public/favicon.svg`** — brand mark, must stay crisp at 16px.

---

## 7. IP safeguards

Four independent layers, because any single one can fail:

1. **Original-fiction foundation.** Every franchise, character, event and release is invented for this project (D-037). There is no real IP to accidentally reference, and a Phase 5 scan of all 98,773 characters of content for ~30 major real franchises returned zero hits.
2. **Global negative constraints** on every prompt without exception — 14 clauses covering logos, text, real-person likeness, copyrighted characters, poster/album/box-art recreation, franchise costumes, UI elements, anatomy artefacts, duplicated figures, branded products and scannable codes. Listed in full in `GEMINI_IMAGE_PROMPTS.md` §3.
3. **Category-specific negatives** targeting the likeliest leak per world — no existing superhero emblems for Comics, no real idol likeness or existing lightstick design for K-Pop, no real console hardware for Gaming, no named-mangaka style imitation for Manga, and so on.
4. **Human review before acceptance.** No generated image enters the repository without passing `AI_ASSET_REVIEW_CHECKLIST.md`, which includes a dedicated IP section and an explicit reverse-image-search step.

**No text is ever generated into an image** — which also removes the most common route to an accidental wordmark.

---

## 8. Accessibility rules

- **Every generated asset needs hand-written alt text at acceptance.** It describes what the image actually depicts — the subject, setting and mood — never `"hero image"`, `"character portrait"` or the filename. The manifest carries per-asset alt-text guidance.
- **Alt text must not be auto-generated from the prompt.** The prompt describes intent; alt text must describe the delivered result, which may differ.
- **No information may live only in the artwork.** Category identity, event type, release status and availability are all conveyed in text today and must stay that way, so the app remains fully usable with images disabled or unloaded.
- **Contrast is protected by the art direction**, not by luck: the mandated dark, simplified, low-detail background is what keeps the hub title and tagline legible over the hero. Any candidate with a bright or busy lower third fails review.
- **Decorative-only images** are marked and rendered `alt=""` / `aria-hidden` rather than given filler alt text.
- The existing `contentValidation.test.ts` alt-text assertions (non-empty, ≥10 characters, provenance credit present) apply unchanged to any accepted asset.

---

## 9. Optionality — how the site survives rejection

This is a hard requirement: **any generated asset can be rejected or removed at any time without breaking anything.**

- The 161 procedural SVGs are **not deleted** when a generated asset is accepted. They remain in `public/assets/generated/` as the permanent fallback.
- Replacement is per-asset and independent. Accepting the Anime hero has no bearing on the other 69 approved assets.
- Swapping an asset is a one-line change to a `src` field in the content JSON; reverting is the same one-line change back.
- `contentValidation.test.ts` already enforces that every declared asset resolves to a real file on disk, so a half-finished swap fails the build rather than shipping a broken image.
- Because generation is a separate, later, individually-approved pass, **the shipping site never depends on a generated asset existing.** If the whole Gemini pass were abandoned tomorrow, FandomVerse would be exactly as functional as it is today.
