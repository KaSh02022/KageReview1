// Phase 5B — Gemini visual asset plan generator.
//
// Emits the production planning artifacts for a LATER Gemini generation
// pass. It generates nothing visual and touches no runtime data: the 161
// procedural SVGs from Phase 5 remain the shipping assets until a
// generated image is individually reviewed and accepted (D-042).
//
// Outputs:
//   docs/ASSET_MANIFEST.md          — human-readable inventory
//   docs/GEMINI_IMAGE_PROMPTS.md    — concrete, production-ready prompts
//   docs/asset-manifest.json        — machine-readable, validated by
//                                     scripts/validate-asset-manifest.mjs
//
// Prompts are DERIVED FROM THE REAL CONTENT DATA (characters.json etc.)
// rather than hand-typed, so a renamed character or franchise can never
// silently leave a stale prompt behind. Re-run after any content change.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DATA_DIR = join(ROOT, 'src', 'data')
const DOCS_DIR = join(ROOT, 'docs')

const read = (name) => JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8'))
const categories = read('categories.json')
const characters = read('characters.json')
const galleries = read('galleries.json')
const articles = read('articles.json')
const media = read('media.json')
const releases = read('releases.json')
const merchandise = read('merchandise.json')
const events = read('events.json')

// ---------------------------------------------------------------------
// Canonical image classes — dimensions derived from MEASURED render sizes
// (Playwright, chromium, DPR 1) at 375 / 768 / 1440 / 1920 viewports.
// ---------------------------------------------------------------------

const IMAGE_CLASSES = {
  'CLASS-HERO': {
    aspect: '16:9',
    master: '2560x1440',
    delivered: ['1920x1080', '1280x720', '640x360'],
    measured: 'desktop 1392x280 (~5:1) · tablet 720x280 (~2.6:1) · mobile 327x272 (~1.2:1)',
    crop: 'object-fit: cover into a fixed-height band',
    safeArea:
      'Subject must sit inside the central 60% horizontally AND the central 36% vertically. Desktop shows only a ~280px band from the middle of the scaled image; mobile shows a near-square centre crop. Anything near an edge will be cut on one viewport or the other.',
  },
  'CLASS-CARD': {
    aspect: '4:3',
    master: '1600x1200',
    delivered: ['1280x960', '640x480', '320x240'],
    measured: 'featured card 638x479 · standard card 264x198–350x263 · dense card 158x118–174x131',
    crop: 'object-fit: cover into a 4:3 box (native ratio — no crop)',
    safeArea:
      'No crop at any viewport, but the image is displayed as small as 158px wide. The subject must be readable as a silhouette at 158px. Keep detail large and contrast high; avoid fine linework.',
  },
  'CLASS-PORTRAIT': {
    aspect: '1:1',
    master: '1024x1024',
    delivered: ['1024x1024', '560x560', '320x320'],
    measured: 'detail page 280x280 (1:1, all viewports) · hub card crop 158x118–172x129 (4:3)',
    crop: 'shown 1:1 on the detail page, and centre-cropped to 4:3 inside the hub card',
    safeArea:
      'The face/head must sit inside the central 4:3 band of the square, because the hub card crops the top and bottom ~12% away. Head-and-shoulders framing, head slightly above centre but never in the top eighth.',
  },
}

// ---------------------------------------------------------------------
// Global visual language
// ---------------------------------------------------------------------

const GLOBAL_STYLE = {
  medium:
    'stylised cinematic digital painting, painterly concept-art finish, semi-realistic (roughly 70% stylised / 30% realistic)',
  lighting:
    'a single dominant coloured key light in the category accent colour, placed as a rim/backlight, with soft volumetric haze and gentle bloom; deep shadows that still retain detail',
  palette:
    'a near-black desaturated blue base (#0b0e17 to #10131f) carrying ONE dominant accent hue, plus warm neutral highlights; at most three hues total',
  contrast: 'high cinematic contrast, dark overall key, bright accent core',
  depth:
    'clear foreground / midground / background separation using atmospheric perspective and haze',
  background:
    'dark, simplified and low-detail so that interface text remains legible over it and the image still reads at 158px wide',
  composition:
    'centred or rule-of-thirds subject with generous negative space; the subject core stays inside the central 60% of the frame',
  texture: 'subtle fine film grain and soft light bloom; no heavy noise, no visible brush chaos',
  shadow: 'soft directional shadows tinted with the accent hue, never pure black',
  motif:
    'a faint recurring geometric signature — a nested polygonal core with a few drifting orbiting motes — rendered subtly in the background haze as the shared connective tissue of the FandomVerse universe',
}

const GLOBAL_NEGATIVES = [
  'no logos, wordmarks, brand marks or trademarks',
  'no text, letters, numerals, captions, subtitles or credits',
  'no watermark, signature, artist mark or stock-library overlay',
  'no recognisable real person, celebrity, actor, musician, athlete or streamer likeness',
  'no copyrighted or trademarked characters from any existing franchise',
  'no recreation of an existing movie poster, album cover, game box art or book cover',
  'no franchise-specific costume, insignia, emblem or colour scheme',
  'no user-interface elements, frames, borders, device mockups or screenshots',
  'no malformed hands, extra fingers, extra limbs or distorted faces',
  'no duplicated, cloned or mirrored figures',
  'no gore, sexualised content, or minors in distress',
  'no real-world branded products or packaging',
  'no QR codes, barcodes or scannable patterns',
  'no photorealistic human face intended to resemble any living individual',
]

// ---------------------------------------------------------------------
// Seven worlds — category visual identities
// ---------------------------------------------------------------------

const CATEGORY_STYLE = {
  anime: {
    accentHex: '#ff5d73',
    accentName: 'ember rose',
    environment: 'wind-scoured ash plains and broken shrine gates beneath a slowly dimming sky',
    materials: 'worn travel cloth, lacquered dark steel, drifting embers, frayed rope binding',
    signature: 'ember gradients and clean blade-light streaks cutting across the haze',
    mood: 'wandering, resolute, quietly mournful',
    negatives: [
      'no existing anime franchise character designs or signature hairstyles',
      'no school uniforms resembling any specific series',
      'no visible manga/anime studio marks',
    ],
  },
  gaming: {
    accentHex: '#33d0ff',
    accentName: 'signal cyan',
    environment: 'an industrial exclusion zone of collapsed gantries, sodium haze and dead drop-ships',
    materials: 'matte armour plate, scuffed polymer, holographic glass, exposed cabling',
    signature: 'faint HUD grid lines and signal-flare glows dissolving into the atmosphere',
    mood: 'tense, tactical, under pressure',
    negatives: [
      'no real console, controller, PC hardware or peripheral brand shapes',
      'no replication of any existing game HUD, weapon skin or class icon',
      'no esports team branding',
    ],
  },
  movies: {
    accentHex: '#ffb648',
    accentName: 'amber spotlight',
    environment: 'rain-slick neo-noir streets, arched underpasses and shuttered late-night frontages',
    materials: 'wet asphalt, brass fittings, damp wool overcoats, cigarette and steam haze',
    signature: 'hard spotlight cones raking through rain, with a soft film-grain vignette',
    mood: 'suspicious, melancholy, unresolved',
    negatives: [
      'no real actor likeness or period celebrity resemblance',
      'no real film title treatment, studio ident or award statuette',
      'no recreation of a known noir film frame',
    ],
  },
  'tv-shows': {
    accentHex: '#8f7bff',
    accentName: 'violet archive',
    environment: 'a vast catalogued archive hall of racked glass fragments and endless indexed shelving',
    materials: 'etched glass, brushed steel, archival paper, suspended dust motes',
    signature: 'soft horizontal scanline banding and refracted archive-glass caustics',
    mood: 'curious, secretive, slow-burning',
    negatives: [
      'no broadcast network idents or channel bugs',
      'no recreation of an existing series title sequence',
      'no recognisable television set or streaming-device shapes',
    ],
  },
  kpop: {
    accentHex: '#ff5de0',
    accentName: 'magenta bloom',
    environment: 'a concert stage and the bokeh ocean of a crowd holding lights, seen through haze',
    materials: 'satin, sequin, chrome trim, polished stage floor, lens-flare glass',
    signature: 'blooming stage-light shafts and a sea of soft out-of-focus light points',
    mood: 'euphoric, polished, electric',
    negatives: [
      'no real idol, group or performer likeness',
      'no real group logo, fandom symbol or existing lightstick design',
      'no recreation of a known stage set or music-video frame',
      'the lightstick silhouette must be an original invented shape',
    ],
  },
  comics: {
    accentHex: '#ffe14d',
    accentName: 'ink yellow',
    environment: 'city rooftops and steel water-tower skylines at hard dusk',
    materials: 'enamelled armour plate, riveted steel, inked linework, halftone shading',
    signature: 'bold ink contour and visible halftone dot texture in the shadow falloff',
    mood: 'heroic, weathered, defiant',
    negatives: [
      'no existing superhero emblem, chest symbol or costume colourway',
      'no caped red-and-blue, bat, spider, shield or lightning-bolt motifs',
      'no recreation of a known comic cover or publisher trade dress',
    ],
  },
  manga: {
    accentHex: '#5ce6a6',
    accentName: 'jade talisman',
    environment: 'moonlit shrine grounds, paper-strung torii paths and still black water',
    materials: 'rice paper, ink wash, talisman slips, worn wood, cold moonlight',
    signature: 'screentone-like monochrome fields broken by a single accent hue',
    mood: 'haunted, tender, unresolved',
    negatives: [
      'no imitation of a named mangaka’s signature style',
      'no existing manga series character or yokai design',
      'no publisher trade dress or volume-spine layout',
    ],
  },
}

// ---------------------------------------------------------------------
// Asset classification (A/B/C/D) — see docs/AI_IMAGE_ASSET_BIBLE.md §6
// ---------------------------------------------------------------------

const TIERS = {
  B: 'ENHANCE WITH GEMINI (approved for generation)',
  C: 'OPTIONAL GEMINI ALTERNATIVE (deferred — needs Director approval)',
  A: 'KEEP PROCEDURAL (no generation planned)',
  D: 'DO NOT REPLACE (architectural — must stay procedural)',
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** Capitalises the first letter, so shared style fragments read as sentences when joined. */
const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const accentOf = (categoryId) => CATEGORY_STYLE[categoryId]

/** Composes one production-ready prompt from the shared language + a per-asset brief. */
function composePrompt({ categoryId, subject, framing, extraNegatives = [] }) {
  const cat = accentOf(categoryId)
  const category = categories.find((c) => c.id === categoryId)
  return [
    `SUBJECT: ${subject}`,
    `FRANCHISE CONTEXT: "${category.franchise}", an original fictional property created for FandomVerse. It is not based on, and must not resemble, any existing real-world franchise.`,
    `COMPOSITION & FRAMING: ${framing}`,
    `ENVIRONMENT: ${sentence(cat.environment)}.`,
    `LIGHTING: ${sentence(GLOBAL_STYLE.lighting)}. The key light is ${cat.accentName} (${cat.accentHex}).`,
    `PALETTE: ${sentence(GLOBAL_STYLE.palette)}. The dominant accent is ${cat.accentName} ${cat.accentHex}.`,
    `MOOD: ${sentence(cat.mood)}.`,
    `MATERIAL & TEXTURE: ${sentence(cat.materials)}. ${sentence(GLOBAL_STYLE.texture)}.`,
    `DEPTH & BACKGROUND: ${sentence(GLOBAL_STYLE.depth)}. ${sentence(GLOBAL_STYLE.background)}.`,
    `SHADOW: ${sentence(GLOBAL_STYLE.shadow)}.`,
    `CATEGORY SIGNATURE: ${sentence(cat.signature)}.`,
    `UNIVERSE MOTIF: ${sentence(GLOBAL_STYLE.motif)}.`,
    `STYLE: ${sentence(GLOBAL_STYLE.medium)}. ${sentence(GLOBAL_STYLE.contrast)}.`,
    `NEGATIVE CONSTRAINTS: ${[...GLOBAL_NEGATIVES, ...cat.negatives, ...extraNegatives].join('; ')}.`,
  ].join('\n')
}

const assets = []

// --- CLASS-HERO — 7 category heroes (Tier B) -------------------------
for (const category of categories) {
  const cat = accentOf(category.id)
  assets.push({
    assetId: `GEM-hero-${category.id}`,
    filename: `hero-${category.id}.webp`,
    categoryId: category.id,
    assetType: 'category-hero',
    imageClass: 'CLASS-HERO',
    tier: 'B',
    priority: 'P1',
    intendedPage: `Category hub /${category.slug} — full-width hero band`,
    replaces: category.heroImage.src,
    altTextGuidance: `Describe the ${category.name} hub's hero scene concretely (setting, mood, key subject) — never "hero image".`,
    prompt: composePrompt({
      categoryId: category.id,
      subject: `A wide establishing landscape that captures the whole world of "${category.franchise}" at a glance — no central character, the place itself is the subject. ${category.visualMotif} should read as the defining visual idea.`,
      framing:
        'Extreme wide cinematic establishing shot, horizon low in the frame, strong central focal depth. CRITICAL: this is displayed as a narrow horizontal band on desktop (roughly a 5:1 slice taken from the vertical centre) and as a near-square centre crop on mobile. All meaningful content must sit within the central 60% horizontally and the central 36% vertically. Keep the extreme top and bottom of the frame as empty atmosphere.',
      extraNegatives: ['no foreground character faces', 'no single dominant silhouette blocking the centre'],
    }),
  })
}

// --- CLASS-PORTRAIT — 35 character portraits (Tier B) ----------------
for (const character of characters) {
  const category = categories.find((c) => c.id === character.categoryId)
  const tags = character.tags
  const isAi = tags.includes('ai-companion') || tags.includes('non-human')
  const isSpirit = tags.includes('spirit')

  const being = isAi
    ? 'an original non-human artificial intelligence presence, expressed as a luminous geometric construct with a suggested but non-human form — no human face'
    : isSpirit
      ? 'an original ethereal spirit figure, semi-translucent, with a humanlike silhouette that dissolves into drifting light at its edges'
      : 'an original fictional character, entirely invented'

  const traitClause = character.traits.join(', ').toLowerCase()

  assets.push({
    assetId: `GEM-character-${character.categoryId}-${slug(character.name)}`,
    filename: `character-${character.id.replace('character-', '')}.webp`,
    categoryId: character.categoryId,
    assetType: 'character-portrait',
    imageClass: 'CLASS-PORTRAIT',
    tier: 'B',
    priority: 'P1',
    intendedPage: `Character detail /character/${character.id} (1:1) and the ${category.name} hub character card (4:3 crop)`,
    replaces: character.image.src,
    altTextGuidance: `Describe ${character.name}'s appearance and bearing — never "character portrait".`,
    prompt: composePrompt({
      categoryId: character.categoryId,
      subject: `A character portrait of ${character.name}, the ${character.role} of "${category.franchise}". They are ${being}. Their bearing should read as ${traitClause}. Costume and design must be invented for this project and must not resemble any existing franchise character.`,
      framing:
        'Head-and-shoulders portrait, square 1:1 frame, subject facing slightly off-camera, shoulders squared to camera. CRITICAL: the face and head must sit inside the central 4:3 band of the square, because the card view crops roughly the top and bottom 12%. Never place the head in the top eighth of the frame. Silhouette must stay readable at 158px wide.',
      extraNegatives: isAi
        ? ['no human face on the AI construct', 'no humanoid android skin texture']
        : [],
    }),
  })
}

// --- CLASS-CARD — 28 gallery pieces (Tier B) -------------------------
const GALLERY_SLOTS = [
  {
    match: /palette study/i,
    subject: (cat) => `An atmospheric establishing view of the world of "${cat.franchise}" — environment only, no characters. A mood and palette study.`,
    framing: 'Wide landscape 4:3 composition, horizon on the lower third, deep atmospheric recession.',
  },
  {
    match: /reimagined as abstract colour study|reimagined as abstract color study/i,
    subject: (cat) => `A dramatic key moment from "${cat.franchise}", rendered as a bold, near-abstract colour study — forms simplified to silhouette and light.`,
    framing: 'Centred 4:3 composition, heavy simplification, large flat shapes, minimal fine detail.',
  },
  {
    match: /title-card/i,
    subject: (cat) => `An iconic symbolic composition for "${cat.franchise}": a single emblematic object or shape from its world, centred as a title-card style image.`,
    framing: 'Perfectly centred 4:3 composition, single hero object, generous symmetrical negative space.',
  },
  {
    match: /fan-art jam/i,
    subject: (cat) => `A group silhouette composition showing several original characters of "${cat.franchise}" backlit together, read purely as shapes.`,
    framing: 'Wide 4:3 composition, figures backlit into near-silhouette, faces not legible.',
  },
]

for (const gallery of galleries) {
  const category = categories.find((c) => c.id === gallery.categoryId)
  for (const image of gallery.images) {
    const slot = GALLERY_SLOTS.find((s) => s.match.test(image.caption)) ?? GALLERY_SLOTS[0]
    assets.push({
      assetId: `GEM-gallery-${image.id.replace('gallery-', '')}`,
      filename: `${image.id}.webp`,
      categoryId: gallery.categoryId,
      assetType: 'gallery-artwork',
      imageClass: 'CLASS-CARD',
      tier: 'B',
      priority: 'P2',
      intendedPage: `${category.name} hub — Gallery section (${image.title})`,
      replaces: image.src,
      altTextGuidance: `Describe what the piece actually depicts — never "gallery image".`,
      prompt: composePrompt({
        categoryId: gallery.categoryId,
        subject: slot.subject(category),
        framing: `${slot.framing} Native 4:3 — no crop is applied, but the image is displayed as small as 158px wide, so the composition must survive heavy downscaling.`,
        extraNegatives: slot.match.source.includes('fan-art')
          ? ['no legible facial features on the silhouetted figures']
          : [],
      }),
    })
  }
}

// --- Tier C / A / D — catalogued, not prompted ------------------------
const deferred = [
  ...articles.map((a) => ({
    assetId: `GEM-article-${a.id.replace('article-', '')}`,
    filename: `${a.id}.webp`,
    categoryId: a.categoryId,
    assetType: 'article-thumbnail',
    imageClass: 'CLASS-CARD',
    tier: 'C',
    priority: 'P3',
    intendedPage: `Article card + /article/${a.id} detail hero`,
    replaces: a.thumbnail.src,
  })),
  ...media.map((m) => ({
    assetId: `GEM-trailer-${m.id.replace('media-', '')}`,
    filename: `${m.id}.webp`,
    categoryId: m.categoryId,
    assetType: 'trailer-thumbnail',
    imageClass: 'CLASS-CARD',
    tier: 'C',
    priority: 'P3',
    intendedPage: `Trailers section + /trailers`,
    replaces: m.thumbnail.src,
  })),
  ...releases.map((r) => ({
    assetId: `GEM-release-${r.id.replace('release-', '')}`,
    filename: `${r.id}.webp`,
    categoryId: r.categoryId,
    assetType: 'release-artwork',
    imageClass: 'CLASS-CARD',
    tier: 'C',
    priority: 'P3',
    intendedPage: `Upcoming Releases section + /releases`,
    replaces: r.coverImage.src,
  })),
]

const keptProcedural = [
  ...merchandise.map((m) => ({
    assetId: `PROC-merch-${m.id.replace('merch-', '')}`,
    filename: m.image.src,
    categoryId: m.categoryId,
    assetType: 'merchandise-artwork',
    imageClass: 'CLASS-CARD',
    tier: 'A',
    priority: '—',
    intendedPage: `Merchandise section + /product/${m.id}`,
    replaces: null,
  })),
  ...events.map((e) => ({
    assetId: `PROC-event-${e.id.replace('event-', '')}`,
    filename: e.image.src,
    categoryId: e.categoryId,
    assetType: 'event-visual',
    imageClass: 'CLASS-CARD',
    tier: 'A',
    priority: '—',
    intendedPage: `Events section + /event/${e.id}`,
    replaces: null,
  })),
]

// ---------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------

const approved = assets
const byCategory = (list, id) => list.filter((a) => a.categoryId === id).length
const byType = (list) =>
  Object.entries(
    list.reduce((acc, a) => ({ ...acc, [a.assetType]: (acc[a.assetType] ?? 0) + 1 }), {}),
  )

const manifest = {
  generatedBy: 'scripts/generate-asset-plan.mjs',
  phase: '5B',
  status: 'PLANNING — no image has been generated, and no runtime data references these files yet',
  imageClasses: IMAGE_CLASSES,
  tiers: TIERS,
  counts: {
    // Was a hardcoded 161 — correct only by accident, since it happened to
    // equal the sum below at the moment it was written and nothing had
    // changed the tiers since. Adding real merchandise photography (Tier A)
    // exposed it: assets.length moved to 189 but this literal did not.
    // Computed now, so it can never go stale again.
    currentProceduralAssets: approved.length + deferred.length + keptProcedural.length,
    approvedForGeneration: approved.length,
    deferredOptional: deferred.length,
    keptProcedural: keptProcedural.length,
  },
  assets: [...approved, ...deferred, ...keptProcedural].map((a) => ({ ...a, prompt: undefined })),
}
writeFileSync(join(DOCS_DIR, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

// --- ASSET_MANIFEST.md ---
const manifestRows = (list) =>
  list
    .map(
      (a) =>
        `| \`${a.assetId}\` | ${a.categoryId} | ${a.assetType} | \`${a.filename}\` | ${a.imageClass} | ${IMAGE_CLASSES[a.imageClass].aspect} | ${IMAGE_CLASSES[a.imageClass].master} | ${a.intendedPage} | ${a.priority} | ${a.replaces ? `\`${a.replaces}\`` : '— (no replacement planned)'} |`,
    )
    .join('\n')

const header =
  '| Asset ID | Category | Type | Filename | Class | Aspect | Master px | Intended page | Priority | Replacement target |\n|---|---|---|---|---|---|---|---|---|---|'

writeFileSync(
  join(DOCS_DIR, 'ASSET_MANIFEST.md'),
  `# Gemini Asset Manifest (Phase 5B — planning artifact)

**Generated by \`scripts/generate-asset-plan.mjs\`. Do not hand-edit.**

**Status: PLANNING ONLY.** No image has been generated. No entry in \`src/data/*.json\` points at any filename in this manifest. The 161 procedural SVGs from Phase 5 remain the shipping assets and the permanent fallback (D-042/D-045).

## Summary

| Metric | Count |
|---|---|
| Current procedural SVG assets (shipping today) | ${manifest.counts.currentProceduralAssets} |
| **Approved for Gemini generation (Tier B)** | **${manifest.counts.approvedForGeneration}** |
| Deferred / optional (Tier C, needs approval) | ${manifest.counts.deferredOptional} |
| Deliberately kept procedural (Tier A) | ${manifest.counts.keptProcedural} |

### Approved (Tier B) by category

| Category | ${categories.map((c) => c.name).join(' | ')} |
|---|${categories.map(() => '---').join('|')}|
| Assets | ${categories.map((c) => byCategory(approved, c.id)).join(' | ')} |

### Approved (Tier B) by asset type

| Type | Count |
|---|---|
${byType(approved)
  .map(([type, count]) => `| ${type} | ${count} |`)
  .join('\n')}

## Tier B — approved for generation (${approved.length})

${header}
${manifestRows(approved)}

## Tier C — optional, deferred pending Director approval (${deferred.length})

These are catalogued so the cost of a full visual pass is known, but **no prompts have been written for them** and they are not approved. Rationale for deferral is in \`AI_IMAGE_ASSET_BIBLE.md\` §6.

${header}
${manifestRows(deferred)}

## Tier A — deliberately kept procedural (${keptProcedural.length})

These stay as procedural SVG by design, not by omission — see \`AI_IMAGE_ASSET_BIBLE.md\` §6 for the reasoning (in short: merchandise art depicts products that do not exist, and event art is decorative next to load-bearing date/location/type text).

${header}
${manifestRows(keptProcedural)}

## Tier D — must not be replaced

| Asset | Why |
|---|---|
| The Fandom Core WebGL scene (\`src/features/universe/FandomCoreScene.tsx\`) | Procedural Three.js geometry is the architecture (D-031/D-033). Replacing it with generated imagery would break the progressive-enhancement contract and the reduced-motion/no-WebGL paths. |
| The Fandom Core 2D CSS fallback | It is the guaranteed-available layer; it must not depend on any downloadable asset. |
| \`public/favicon.svg\` | Brand mark, hand-authored, must stay crisp at 16px. |
`,
  'utf8',
)

// --- GEMINI_IMAGE_PROMPTS.md ---
const promptSections = categories
  .map((category) => {
    const catAssets = approved.filter((a) => a.categoryId === category.id)
    const cat = accentOf(category.id)
    return `## ${category.name} — *${category.franchise}*

**Accent:** ${cat.accentName} \`${cat.accentHex}\` · **Signature:** ${cat.signature}
**Environment:** ${cat.environment}
**Materials:** ${cat.materials} · **Mood:** ${cat.mood}

**Category-specific negatives (added to the global block):** ${cat.negatives.join('; ')}.

${catAssets
  .map(
    (a) => `### \`${a.assetId}\`

- **File:** \`${a.filename}\` · **Class:** ${a.imageClass} (${IMAGE_CLASSES[a.imageClass].aspect}, master ${IMAGE_CLASSES[a.imageClass].master})
- **Used on:** ${a.intendedPage}
- **Replaces:** \`${a.replaces}\`
- **Alt text on acceptance:** ${a.altTextGuidance}

\`\`\`text
${a.prompt}
ASPECT RATIO: ${IMAGE_CLASSES[a.imageClass].aspect}. Render at ${IMAGE_CLASSES[a.imageClass].master} or larger.
OUTPUT: a single image, no grid, no variations sheet, no border.
\`\`\`
`,
  )
  .join('\n')}`
  })
  .join('\n---\n\n')

writeFileSync(
  join(DOCS_DIR, 'GEMINI_IMAGE_PROMPTS.md'),
  `# Gemini Image Prompts (Phase 5B)

**Generated by \`scripts/generate-asset-plan.mjs\` from the live content data. Do not hand-edit** — re-run the script after any content change so a renamed character can never leave a stale prompt behind.

**No image has been generated from these prompts.** They are a production specification for a later, separately-approved pass (D-042).

Every prompt below is fully composed and ready to paste. ${approved.length} prompts, covering every Tier B asset in \`ASSET_MANIFEST.md\`.

## 1. How a prompt is composed

Each prompt is the global visual language plus a per-asset subject brief, assembled in a fixed field order so that output stays consistent across the whole set:

\`SUBJECT\` → \`FRANCHISE CONTEXT\` → \`COMPOSITION & FRAMING\` → \`ENVIRONMENT\` → \`LIGHTING\` → \`PALETTE\` → \`MOOD\` → \`MATERIAL & TEXTURE\` → \`DEPTH & BACKGROUND\` → \`SHADOW\` → \`CATEGORY SIGNATURE\` → \`UNIVERSE MOTIF\` → \`STYLE\` → \`NEGATIVE CONSTRAINTS\` → \`ASPECT RATIO\` → \`OUTPUT\`.

## 2. Global visual language

| Field | Value |
|---|---|
${Object.entries(GLOBAL_STYLE)
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

## 3. Global negative constraints

Applied to **every** prompt without exception:

${GLOBAL_NEGATIVES.map((n) => `- ${n}`).join('\n')}

## 4. Image classes

| Class | Aspect | Master | Delivered | Measured render sizes |
|---|---|---|---|---|
${Object.entries(IMAGE_CLASSES)
  .map(([k, v]) => `| ${k} | ${v.aspect} | ${v.master} | ${v.delivered.join(', ')} | ${v.measured} |`)
  .join('\n')}

## 5. Concrete prompts

${promptSections}
`,
  'utf8',
)

console.log(`approved (Tier B): ${approved.length}`)
console.log(`  heroes:     ${approved.filter((a) => a.assetType === 'category-hero').length}`)
console.log(`  characters: ${approved.filter((a) => a.assetType === 'character-portrait').length}`)
console.log(`  gallery:    ${approved.filter((a) => a.assetType === 'gallery-artwork').length}`)
console.log(`deferred (Tier C): ${deferred.length}`)
console.log(`kept procedural (Tier A): ${keptProcedural.length}`)
console.log(`total catalogued: ${approved.length + deferred.length + keptProcedural.length}`)
