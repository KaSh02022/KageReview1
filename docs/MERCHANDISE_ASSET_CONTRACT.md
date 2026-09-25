# Merchandise asset contract

**Status:** planning artifact. **No production data references these paths yet**,
and none may until the files exist — see §5.

**Created:** 2026-09-25 · companion manifest: `docs/merchandise-asset-plan.json`

---

## 1. What exists today

`src/data/merchandise.json` holds **14** products, two per category, each
pointing at a procedural SVG that is already on disk:

```
/assets/generated/merch/<product-id>.svg      viewBox "0 45 400 300"  (4:3)
```

Those 14 SVGs were self-authored by the Phase 5 content-generation script.
They carry a `credit` field recording that provenance. They are **not**
placeholders to be swapped silently — they are the current shipping art.

## 2. The hard constraint that shapes everything below

`src/data/contentValidation.test.ts` asserts:

> *every declared asset resolves to a real file on disk*

and there is **no image fallback component** anywhere in the UI — no `onError`
handler, no placeholder `src`. `Skeleton` and `LoadingState` cover *loading*,
not *missing*.

**Therefore:** adding any of the 21 planned filenames to `merchandise.json`
before the corresponding file exists turns the suite red. Asset production and
data wiring are two separate steps, in that order.

## 3. This is deliberately NOT part of the Gemini pipeline

`docs/asset-manifest.json` is the frozen Gemini manifest. `assetManifest.test.ts`
pins it at exactly **161** assets and gates the approved types to
`category-hero`, `character-portrait` and `gallery-artwork`.

Merchandise is none of those. Adding it there would break both the count and
the type gate, so this contract lives in its own document and its own manifest
file. **Nothing in the Gemini pipeline is touched.**

## 4. Naming scheme — 21 planned assets

Three per category. The slug is `<category-slug>-<product>`, lowercase,
hyphenated, no category prefix duplication.

> **Watch the K-Pop id.** The category **id** is `kpop` (no hyphen); the
> **route path** is `k-pop` (hyphenated). The asset slug follows the *id*,
> so `kpop-lightstick`, matching the existing `merch-kpop-*` products.

| Category (id) | Slugs |
|---|---|
| Anime (`anime`) | `anime-artbook` · `anime-hoodie` · `anime-acrylic-stand` |
| Gaming (`gaming`) | `gaming-desk-mat` · `gaming-hoodie` · `gaming-collectible` |
| Movies (`movies`) | `movies-poster` · `movies-clapperboard-collectible` · `movies-mug` |
| TV Shows (`tv-shows`) | `tv-notebook` · `tv-tote-bag` · `tv-hoodie` |
| K-Pop (`kpop`) | `kpop-lightstick` · `kpop-photocard-set` · `kpop-stage-hoodie` |
| Comics (`comics`) | `comics-art-print` · `comics-enamel-pin-set` · `comics-cap` |
| Manga (`manga`) | `manga-artbook` · `manga-scroll-print` · `manga-tote` |

## 5. Paths and dimensions

| Role | Path | Format | Size | In Git? |
|---|---|---|---|---|
| Master | `_merch_masters/<slug>.png` | PNG | 1600 × 1200 | **No** — add to `.gitignore` alongside the Gemini masters when the folder is created |
| Runtime | `/assets/merch/<slug>.webp` | WebP | 800 × 600 | Yes |

- **Aspect ratio 4:3**, fixed. `Card`'s `.media` is `aspect-ratio: 4 / 3` with
  `object-fit: cover`, so anything else is cropped.
- Runtime lives under `/assets/merch/`, **not** `/assets/gemini/`, keeping it
  clear of the frozen pipeline and its `USE_MASTERS` switch.
- Existing SVG products keep their current `/assets/generated/merch/` paths.
  Replacing them is a separate decision, not part of this contract.

## 6. Data shape each new product must supply

Matching the existing `MerchandiseItem` exactly — no schema change:

```jsonc
{
  "id": "merch-anime-artbook",          // "merch-" + slug
  "categoryId": "anime",                 // the category ID, not the route path
  "name": "…",                          // original fictional product name
  "image": {
    "src": "/assets/merch/anime-artbook.webp",
    "alt": "…",                         // ≥ 10 characters, or validation fails
    "credit": "…"                       // required, or validation fails
  },
  "priceRangeMin": 0, "priceRangeMax": 0, "currency": "USD",
  "description": "…",
  "tags": ["anime", "…"],
  "status": "available" | "coming-soon" | "sold-out"
}
```

## 7. Content rules for the art

All 21 depict **original fictional FandomVerse products**, tied to the seven
in-house franchises (Starlit Ronin, Ashfall Protocol, Midnight Meridian,
The Glass Archive, LUNARIS, Ironclad Vanguard, Paper Moon Requiem).

Prohibited without exception: existing anime/game/film/comic/K-pop IP; real
celebrity likeness; real brand logos or trademarks; copied posters, covers or
key art; real-world product branding; watermark removal; modification of any
third-party copyrighted asset.

## 8. Order of work

1. Produce the 21 masters into `_merch_masters/` (separate asset-production
   phase — **not** this task).
2. Derive 800 × 600 WebP into `public/assets/merch/`.
3. Ignore the masters folder in `.gitignore`.
4. *Only then* add the 21 entries to `src/data/merchandise.json`.
5. Run `npm run test` — `contentValidation` proves every path resolves.

Steps 1–2 are deliberately out of scope here: no images were fabricated and
none were downloaded.
