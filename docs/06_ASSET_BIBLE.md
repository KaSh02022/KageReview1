# 06 — Asset Bible

Defines asset identification, formats, and standards. No assets exist yet as of Phase 0 — this document establishes the rules Phase 2+ asset production (via Gemini for visuals) must follow, plus the license-verification gate every asset must clear before use (see `00_PROJECT_CONSTITUTION.md` §10 and `08_LICENSES.md`).

**Phase 5 status:** the project now ships **161 visual assets**, all of them procedurally generated SVG authored by `scripts/generate-content.mjs` and committed under `public/assets/generated/` (D-036). Nothing is sourced externally, and no AI image generation has been used — the prompts in §9 below remain unexecuted drafts. Breakdown: 7 category heroes, 35 character portraits, 28 gallery pieces, 21 event banners, 21 article thumbnails, 21 release covers, 14 trailer thumbnails, 14 merchandise tiles. Every asset is deterministic (seeded by its entity's id), reproducible by re-running the script, carries a provenance string in its `AssetRef.credit`, and is covered by `contentValidation.test.ts`, which fails if any declared asset is missing from disk or has weak alt text. Card art is authored at 4:3 to match `CardMedia`'s crop, and deliberately does **not** draw the entity title into the image, since every card renders the title as real text (D-040).

**Phase 4 status:** zero image/texture/model assets at that point. The Fandom Core cinematic entry (`02_PRODUCT_ARCHITECTURE.md` §15) is entirely procedural — Three.js primitive geometries, code-driven materials, and CSS gradients — per the Director's explicit Phase 4 instruction to prefer procedural geometry and stop before integrating any external/generated asset (D-033). No Gemini prompts from §9 below have been executed yet; that remains later-phase scope.

## 1. Asset ID Convention

`ASSET-<domain>-<category>-<slug>-<variant>`

- `domain`: `hero`, `card`, `gallery`, `character`, `event`, `merch`, `icon`, `3d`, `ui`
- `category`: `anime`, `gaming`, `movies`, `tvshows`, `kpop`, `comics`, `manga`, or `global`
- `slug`: short kebab-case descriptor
- `variant`: `sm` / `md` / `lg` / `xl` where responsive variants exist

Example: `ASSET-character-anime-kaida-nova-lg`

## 2. Asset Types & Standards

| Type | Format | Notes |
|---|---|---|
| 2D photographic/illustrative images | WebP (primary), PNG/JPEG fallback if needed | Responsive `srcset` variants (`sm`/`md`/`lg`) for hero/card images |
| Icons | SVG | Inline or sprite; must scale without blur; `aria-hidden` unless meaningful alone |
| 3D assets (cinematic layer) | glTF/GLB (draco-compressed where supported) | Kept lightweight — see performance targets below |
| Video | MP4 (H.264) for any self-hosted clip; otherwise YouTube embed per `media.json` | Self-hosted video only if licensing requires it — prefer embeds to keep bundle small |
| Audio | MP3/OGG | Podcast-style clips, short previews |
| Fonts | WOFF2 | Subset where practical to reduce payload |

## 3. Dimensions & Aspect Ratios (proposal, finalized in Phase 2)

| Slot | Aspect ratio | Notes |
|---|---|---|
| Category hero | 21:9 or 16:9 | Large cinematic banner |
| Content card thumbnail | 4:3 or 1:1 | Consistent across articles/gallery/media cards |
| Character portrait | 3:4 | Portrait orientation for profile cards |
| Merchandise image | 1:1 | Product-style consistency |
| Gallery image | Source-native, constrained by max dimension | Lightbox handles varied ratios |

## 4. Compression Targets

- Hero/banner images: target ≤ 300KB delivered (WebP, responsive `srcset`).
- Card thumbnails: target ≤ 80KB delivered.
- 3D scene total payload (geometry + textures) for the cinematic entry: target ≤ 5MB initial, lazy-loaded, to protect NFR-005 (performance) on first load.
- All targets re-validated against actual Lighthouse results in Phase 13 (Performance Optimization).

## 5. Naming Conventions

- Files on disk: `<asset-id>.<ext>` (lowercase, hyphenated), stored under `src/assets/<domain>/<category>/`.
- Every asset referenced from data (`AssetRef.src`, see `05_DATA_SCHEMA.md`) points to its on-disk path; no inline base64 embedding except tiny UI icons where justified.

## 6. Accessibility Metadata

- Every `AssetRef` requires non-empty `alt` text describing the image's content/purpose (not just a filename).
- Decorative-only images (pure background texture) are marked and rendered with `alt=""` / `aria-hidden`, never left with placeholder alt text like "image".
- Video/audio embeds include a text description in the surrounding UI (title + description fields already in `media.json`) so the content is discoverable even without playing the media.

## 7. Mobile Fallbacks

- The 3D cinematic entry has a static-image fallback for low-end devices / WebGL-unavailable contexts (same hero art direction, non-interactive).
- Large gallery/video assets use responsive `srcset`/`sizes` so mobile never downloads desktop-resolution assets.

## 8. Attribution / License Metadata

Every non-originally-created asset entry must have a matching row in `08_LICENSES.md` before it is committed — see that document for the required fields. This Asset Bible tracks *what* an asset is; `08_LICENSES.md` tracks *whether we're allowed to use it*.

## 9. Gemini Asset Prompts

This section holds prompt drafts for Gemini-based visual generation, to be refined and executed in Phase 2 (Design System) and Phase 5–8 (content population). No assets have been generated yet — these are starting prompts, not a record of completed work.

**Style direction constraint for every prompt below:** original fandom-portal aesthetic, NOT a copy of any specific real franchise's official art, NOT a copy of Kage's imagery/branding. Aim for a distinct, cohesive "FandomVerse" visual identity across all 7 categories, with per-category accent variation.

- `ASSET-hero-global-universe-xl` — "Cinematic wide-format digital illustration of an abstract, glowing multi-dimensional 'universe' made of seven distinct portals or realms, each realm hinting at a different fandom genre (anime, gaming, sci-fi/movies, TV, K-pop stage lights, comics ink lines, manga linework) without depicting any specific copyrighted character or logo. Dark background, luminous connective energy lines between portals, original sci-fi-fantasy hybrid style, 21:9 aspect ratio, high detail, no text."
- `ASSET-hero-anime-xl` — "Wide cinematic banner illustration representing an original anime-inspired world: dynamic action silhouette, vivid sunset palette, speed lines, no recognizable copyrighted characters, original character silhouette design only, 21:9 aspect ratio."
- `ASSET-hero-gaming-xl` — "Wide cinematic banner illustration representing an original gaming-fandom world: neon arcade/esports arena aesthetic, holographic UI elements, original mascot silhouette, no real game logos or copyrighted characters, 21:9 aspect ratio."
- `ASSET-hero-movies-xl` — "Wide cinematic banner illustration representing an original movies-fandom world: film-reel and spotlight motif, red-carpet/cinema aesthetic, no recognizable studio logos or copyrighted characters, 21:9 aspect ratio."
- `ASSET-hero-tvshows-xl` — "Wide cinematic banner illustration representing an original TV-fandom world: multi-screen/binge-watch aesthetic, warm living-room-meets-broadcast-studio palette, no recognizable network logos or copyrighted characters, 21:9 aspect ratio."
- `ASSET-hero-kpop-xl` — "Wide cinematic banner illustration representing an original K-pop-fandom world: concert stage lights, lightstick-sea aesthetic, original idol-group silhouette (no real group likeness), vibrant pastel-neon palette, 21:9 aspect ratio."
- `ASSET-hero-comics-xl` — "Wide cinematic banner illustration representing an original comics-fandom world: halftone/ink-line comic-panel aesthetic, bold primary palette, original superhero-style silhouette (no existing copyrighted character), 21:9 aspect ratio."
- `ASSET-hero-manga-xl` — "Wide cinematic banner illustration representing an original manga-fandom world: monochrome screentone linework with a single accent color, dynamic panel-composition feel, original character silhouette only, 21:9 aspect ratio."
- `ASSET-character-<category>-<slug>-lg` (×5 per category, ×35 total) — "Portrait-orientation original character illustration for the FandomVerse [category] hub: [distinct original design brief per character — role/personality/silhouette], consistent semi-realistic/stylized illustration style matching the [category] hero art direction, plain or softly blurred background, 3:4 aspect ratio, no resemblance to existing copyrighted characters."
- `ASSET-icon-global-<name>` (×N, UI icon set) — "Minimal single-color line icon representing [concept: search / bookmark / cart / chatbot / calendar / gallery / filter / sort], consistent 2px stroke weight, square canvas, transparent background, matches a modern original UI icon system (not copied from any existing icon library's branding)."

Each prompt execution must be logged with: prompt used, tool (Gemini + version/date), output asset ID, and license status — recorded in `08_LICENSES.md` at generation time, not retroactively.
