// Phase 5B.1 — Gemini Batch 01 (proof-of-style) preparation.
//
// Selects 14 of the 70 approved assets — 7 category heroes + one canonical
// lead character per category — and emits the batch manifest, execution
// guide and human review sheet.
//
// This generates NO images. It only prepares the instruction set.
//
// Prompts are EXTRACTED VERBATIM from docs/GEMINI_IMAGE_PROMPTS.md rather
// than re-composed here, so the batch physically cannot drift from the
// approved prompt set. If a prompt is missing or duplicated, this script
// fails loudly instead of emitting a partial batch.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DOCS = join(ROOT, 'docs')
const DATA = join(ROOT, 'src', 'data')

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const categories = readJson(join(DATA, 'categories.json'))
const characters = readJson(join(DATA, 'characters.json'))
const manifest = readJson(join(DOCS, 'asset-manifest.json'))
const promptsDoc = readFileSync(join(DOCS, 'GEMINI_IMAGE_PROMPTS.md'), 'utf8')

const BATCH_ID = 'GEMINI-BATCH-01'
const BATCH_NAME = 'Proof-of-Style Batch 01'

// --- selection -------------------------------------------------------
// One canonical lead per category. Chosen by an explicit tag rule
// (protagonist, else leader) rather than by hand, so the choice is
// reproducible and auditable against the dataset.
function canonicalLead(categoryId) {
  const pool = characters.filter((c) => c.categoryId === categoryId)
  const lead =
    pool.find((c) => c.tags.includes('protagonist')) ?? pool.find((c) => c.tags.includes('leader'))
  if (!lead) throw new Error(`no canonical lead found for category "${categoryId}"`)
  return lead
}

/** Pulls one asset's prompt block out of the approved prompts document. */
function extractPrompt(assetId) {
  const heading = `### \`${assetId}\``
  const occurrences = promptsDoc.split(heading).length - 1
  if (occurrences === 0) throw new Error(`no prompt found for ${assetId}`)
  if (occurrences > 1) throw new Error(`prompt for ${assetId} appears ${occurrences} times`)

  const section = promptsDoc.slice(promptsDoc.indexOf(heading) + heading.length)
  const open = section.indexOf('```text')
  const close = section.indexOf('```', open + 7)
  if (open === -1 || close === -1) throw new Error(`malformed prompt block for ${assetId}`)
  return section.slice(open + 7, close).trim()
}

const findAsset = (assetId) => {
  const asset = manifest.assets.find((a) => a.assetId === assetId)
  if (!asset) throw new Error(`${assetId} is not in asset-manifest.json`)
  if (asset.tier !== 'B') throw new Error(`${assetId} is tier ${asset.tier}, not an approved Tier B asset`)
  return asset
}

const HERO_CROP =
  'Displayed as a fixed-height band filled with object-fit: cover. The visible aspect ratio swings from roughly 5:1 on desktop (1392x280) to roughly 1.2:1 on mobile (327x272). ALL critical content must sit inside the central 60% horizontally and the central 36% vertically; treat the outer top and bottom thirds as disposable atmosphere.'

const PORTRAIT_CROP =
  'Shown 1:1 at 280x280 on the character detail page, and centre-cropped to 4:3 (about 165x124) inside the hub card. The face and head must sit inside the central 4:3 band of the square — the card crop discards roughly the top and bottom 12%. Never place the head in the top eighth of the frame. The silhouette must still read at 158px wide.'

const IP_CONSTRAINTS = [
  'Original fictional subject only — no existing franchise character, no recognisable IP.',
  'No real person, celebrity, actor, musician, athlete or streamer likeness.',
  'No logo, wordmark, emblem, insignia or trademark of any kind.',
  'No franchise-specific costume or colourway.',
  'No recreation of an existing poster, album cover, box art or book cover.',
  'No imitation of a named living artist’s signature style.',
  'No text, lettering or numerals anywhere in frame.',
  'No watermark or signature.',
]

const batch = []

for (const category of categories) {
  const assetId = `GEM-hero-${category.id}`
  const asset = findAsset(assetId)
  batch.push({
    asset_id: assetId,
    category: category.id,
    category_name: category.name,
    franchise: category.franchise,
    asset_type: 'category-hero',
    source_content_id: category.id,
    source_content_kind: 'category',
    filename: asset.filename,
    image_class: 'CLASS-HERO',
    aspect_ratio: manifest.imageClasses['CLASS-HERO'].aspect,
    master_dimensions: manifest.imageClasses['CLASS-HERO'].master,
    delivered_dimensions: manifest.imageClasses['CLASS-HERO'].delivered,
    intended_page: asset.intendedPage,
    prompt_reference: `docs/GEMINI_IMAGE_PROMPTS.md#${assetId.toLowerCase()}`,
    prompt: extractPrompt(assetId),
    crop_constraints: HERO_CROP,
    IP_constraints: IP_CONSTRAINTS,
    replaces_current_asset: asset.replaces,
    priority: 'P1',
    status: 'READY_FOR_GEMINI',
  })
}

for (const category of categories) {
  const lead = canonicalLead(category.id)
  const assetId = `GEM-character-${category.id}-${lead.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
  const asset = findAsset(assetId)
  batch.push({
    asset_id: assetId,
    category: category.id,
    category_name: category.name,
    franchise: category.franchise,
    asset_type: 'character-portrait',
    source_content_id: lead.id,
    source_content_kind: 'character',
    character_name: lead.name,
    character_role: lead.role,
    selection_rule: lead.tags.includes('protagonist') ? 'tag: protagonist' : 'tag: leader',
    filename: asset.filename,
    image_class: 'CLASS-PORTRAIT',
    aspect_ratio: manifest.imageClasses['CLASS-PORTRAIT'].aspect,
    master_dimensions: manifest.imageClasses['CLASS-PORTRAIT'].master,
    delivered_dimensions: manifest.imageClasses['CLASS-PORTRAIT'].delivered,
    intended_page: asset.intendedPage,
    prompt_reference: `docs/GEMINI_IMAGE_PROMPTS.md#${assetId.toLowerCase()}`,
    prompt: extractPrompt(assetId),
    crop_constraints: PORTRAIT_CROP,
    IP_constraints: IP_CONSTRAINTS,
    replaces_current_asset: asset.replaces,
    priority: 'P1',
    status: 'READY_FOR_GEMINI',
  })
}

// --- self-checks before writing anything -----------------------------
const problems = []
if (batch.length !== 14) problems.push(`expected 14 assets, built ${batch.length}`)
const heroes = batch.filter((a) => a.asset_type === 'category-hero')
const portraits = batch.filter((a) => a.asset_type === 'character-portrait')
if (heroes.length !== 7) problems.push(`expected 7 heroes, got ${heroes.length}`)
if (portraits.length !== 7) problems.push(`expected 7 portraits, got ${portraits.length}`)
if (new Set(batch.map((a) => a.asset_id)).size !== 14) problems.push('duplicate asset_id')
if (new Set(batch.map((a) => a.filename)).size !== 14) problems.push('duplicate filename')
if (new Set(heroes.map((a) => a.category)).size !== 7) problems.push('heroes do not cover 7 distinct categories')
if (new Set(portraits.map((a) => a.category)).size !== 7) problems.push('portraits do not cover 7 distinct categories')
for (const asset of batch) {
  if (!asset.prompt || asset.prompt.length < 400) problems.push(`${asset.asset_id}: prompt missing or too short`)
  if (!asset.prompt.includes('NEGATIVE CONSTRAINTS:')) problems.push(`${asset.asset_id}: prompt has no negative block`)
  if (!asset.prompt.includes('CRITICAL:')) problems.push(`${asset.asset_id}: prompt has no crop constraint`)
  if (asset.status !== 'READY_FOR_GEMINI') problems.push(`${asset.asset_id}: wrong status`)
}
if (problems.length) {
  console.error('BATCH BUILD FAILED:')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

// --- emit ------------------------------------------------------------
const batchJson = {
  batch_id: BATCH_ID,
  batch_name: BATCH_NAME,
  generated_by: 'scripts/generate-batch-01.mjs',
  phase: '5B.1',
  status: 'PLANNED — no image has been generated',
  purpose:
    'Proof-of-style. Validate the shared visual language across all seven worlds, on the two hardest image classes, before committing to the remaining 56 approved assets.',
  asset_count: batch.length,
  hero_count: heroes.length,
  portrait_count: portraits.length,
  images_generated: 0,
  runtime_integration: 'NONE — no src/data reference points at any filename in this batch',
  assets: batch,
}
writeFileSync(join(DOCS, 'GEMINI_BATCH_01_MANIFEST.json'), `${JSON.stringify(batchJson, null, 2)}\n`, 'utf8')

// --- manifest markdown ---
const row = (a) =>
  `| \`${a.asset_id}\` | ${a.category_name} | ${a.asset_type} | \`${a.source_content_id}\` | \`${a.filename}\` | ${a.aspect_ratio} | ${a.master_dimensions} | ${a.intended_page} | ${a.priority} | ${a.status} |`

writeFileSync(
  join(DOCS, 'GEMINI_BATCH_01_MANIFEST.md'),
  `# Gemini Batch 01 — Manifest (Phase 5B.1)

**Generated by \`scripts/generate-batch-01.mjs\`. Do not hand-edit.**

**Status: PLANNED. No image has been generated.** Nothing in \`src/data/\` references any filename below. The 161 procedural SVGs remain the shipping assets.

## Purpose

${batchJson.purpose}

The two classes in this batch are deliberately the two hardest:

- **CLASS-HERO** has the most punishing crop in the system — the visible ratio swings from ~5:1 on desktop to ~1.2:1 on mobile (D-044).
- **CLASS-PORTRAIT** is the only asset used at two different aspect ratios (1:1 on the detail page, 4:3 cropped in the hub card).

If the style survives both across all seven worlds, the remaining 56 approved assets are low-risk. If it does not, that is far cheaper to learn on 14 images than on 70.

## Batch summary

| Metric | Value |
|---|---|
| Batch ID | \`${BATCH_ID}\` |
| Total assets | ${batch.length} |
| Category heroes | ${heroes.length} (one per category) |
| Character portraits | ${portraits.length} (one canonical lead per category) |
| Images generated so far | **0** |
| Runtime integration | **None** |
| Source | 14 of the 70 Tier B assets approved in \`ASSET_MANIFEST.md\` |

## Character selection rule

Leads were selected by an explicit, reproducible tag rule rather than by preference — the character tagged \`protagonist\`, falling back to \`leader\`. Every ID below is an existing record in \`src/data/characters.json\`; none was invented or renamed.

| Category | Character | ID | Role | Rule |
|---|---|---|---|---|
${portraits.map((a) => `| ${a.category_name} | ${a.character_name} | \`${a.source_content_id}\` | ${a.character_role} | ${a.selection_rule} |`).join('\n')}

## Assets — category heroes (${heroes.length})

| Asset ID | Category | Type | Source content ID | Filename | Aspect | Master | Intended page | Priority | Status |
|---|---|---|---|---|---|---|---|---|---|
${heroes.map(row).join('\n')}

## Assets — character portraits (${portraits.length})

| Asset ID | Category | Type | Source content ID | Filename | Aspect | Master | Intended page | Priority | Status |
|---|---|---|---|---|---|---|---|---|---|
${portraits.map(row).join('\n')}

## Crop constraints

**CLASS-HERO** — ${HERO_CROP}

**CLASS-PORTRAIT** — ${PORTRAIT_CROP}

## IP constraints (every asset)

${IP_CONSTRAINTS.map((c) => `- ${c}`).join('\n')}

Full negative block: \`GEMINI_IMAGE_PROMPTS.md\` §3. Per-asset prompts: \`GEMINI_BATCH_01_EXECUTION.md\`.

## Replacement targets

Each asset below names the procedural SVG it *would* replace **if** it is generated and accepted. Nothing is replaced by this document, and the SVG is retained even after acceptance (D-045).

| Asset ID | Would replace |
|---|---|
${batch.map((a) => `| \`${a.asset_id}\` | \`${a.replaces_current_asset}\` |`).join('\n')}
`,
  'utf8',
)

// --- execution guide ---
const execAsset = (a, i) => `### ${i + 1}. \`${a.asset_id}\`

| | |
|---|---|
| **Category** | ${a.category_name} — *${a.franchise}* |
| **Asset type** | ${a.asset_type} |
| **Source content** | \`${a.source_content_id}\`${a.character_name ? ` (${a.character_name})` : ''} |
| **Output filename** | \`${a.filename}\` |
| **Aspect ratio** | ${a.aspect_ratio} |
| **Output resolution** | ${a.master_dimensions} or larger |
| **Delivered sizes** | ${a.delivered_dimensions.join(', ')} |
| **Intended page** | ${a.intended_page} |
| **Would replace** | \`${a.replaces_current_asset}\` |

**Crop requirement:** ${a.crop_constraints}

**Prompt — paste verbatim, do not paraphrase:**

\`\`\`text
${a.prompt}
\`\`\`
`

writeFileSync(
  join(DOCS, 'GEMINI_BATCH_01_EXECUTION.md'),
  `# Gemini Batch 01 — Execution Guide (Phase 5B.1)

**Generated by \`scripts/generate-batch-01.mjs\`. Do not hand-edit.**

> **No image has been generated.** This document is the instruction set for a generation pass that has not yet been authorised. Running it is a separate, explicitly-approved step.

## 1. Batch objective

${batchJson.purpose}

Success means: place the 14 results side by side and they read as **one production covering seven worlds** — same medium, same lighting model, same contrast and depth, differing only by accent hue, environment and mood. Failure at this stage is cheap and useful; failure discovered after 70 images is neither.

## 2. Standing rules for every image in this batch

- **Generate exactly one image per prompt.** No grids, no variation sheets, no contact sheets, no borders.
- **No text**, lettering, numerals, captions or subtitles anywhere in frame.
- **No logos**, wordmarks, emblems, insignia or trademarks.
- **No watermark** and **no signature**.
- **No UI elements**, frames, device mockups or screenshots.
- **No recognisable existing IP** — no character, costume, colourway or design from any real franchise.
- **No real-person likeness** — no celebrity, actor, musician, athlete or streamer.
- **No trademark recreation** of any kind.
- Paste each prompt **verbatim**. Do not summarise, shorten or "improve" it; the field order and the negative block are load-bearing.
- Record the tool, model/version and date **at the moment of generation** — not afterwards (\`ASSET_PROVENANCE.md\` §2).

## 3. Aspect ratios and output

| Class | Aspect | Output resolution | Delivered |
|---|---|---|---|
| CLASS-HERO | ${manifest.imageClasses['CLASS-HERO'].aspect} | ${manifest.imageClasses['CLASS-HERO'].master} or larger | ${manifest.imageClasses['CLASS-HERO'].delivered.join(', ')} |
| CLASS-PORTRAIT | ${manifest.imageClasses['CLASS-PORTRAIT'].aspect} | ${manifest.imageClasses['CLASS-PORTRAIT'].master} or larger | ${manifest.imageClasses['CLASS-PORTRAIT'].delivered.join(', ')} |

Masters are archived outside the shipped bundle. Only delivered sizes are committed, as WebP. Budgets: hero ≤300KB, card/portrait ≤80KB delivered.

## 4. Crop requirements

**CLASS-HERO (7 assets).** ${HERO_CROP}

This is the single most common way this batch can fail. A composition that looks excellent as a 16:9 image can be worthless once the desktop band takes only the middle ~36% of its height. Check every hero against the band before accepting it.

**CLASS-PORTRAIT (7 assets).** ${PORTRAIT_CROP}

## 5. IP restrictions

${IP_CONSTRAINTS.map((c) => `- ${c}`).join('\n')}

Every prompt also carries the full 14-clause global negative block plus category-specific negatives (\`GEMINI_IMAGE_PROMPTS.md\` §3). These are not optional and must not be trimmed to shorten a prompt.

## 6. The 14 assets

${batch.map(execAsset).join('\n')}

## 7. Human review instructions

No generated image enters the repository without a human review. For each of the 14:

1. Run **\`AI_ASSET_REVIEW_CHECKLIST.md\`** in full. Start with §1 (IP safety) before any aesthetic judgement — a beautiful image that fails IP is still rejected, and admiring it first wastes time.
2. Record the outcome on **\`GEMINI_BATCH_01_REVIEW.md\`**.
3. Check the crop in the **real UI**, not in an image viewer. Drop the file into its slot and look at it at 375px and 1440px.
4. Place it beside the other six categories and ask whether it reads as the same production.

## 8. Rejection criteria

Reject immediately on any of:

- Any IP failure — real person, existing character, logo, trademark, poster recreation, franchise costume, named-artist imitation.
- Any text, lettering, numerals, watermark or signature in frame.
- Anatomy artefacts — malformed hands, distorted faces, extra limbs, duplicated figures.
- Critical content outside the class safe area, so it is lost to cropping.
- Illegible or mushy at the smallest render size (158px for cards, 280px for portraits).
- A bright or busy lower third on a hero, which would compromise hub title legibility.
- Palette drift — more than three hues, or a dominant hue that is not the category accent.
- Style drift — photorealistic, flat-vector, or inconsistent with the other six worlds.
- Weight over budget with no meaningful quality gain over the ~1KB SVG it would replace.
- Platform terms unverifiable ⇒ **Blocked**, not merely rejected.

## 9. Regeneration rules

- **Same prompt, new seed** — for anatomy artefacts, accidental text, or a bad roll where the concept is right. Up to 3 attempts per asset.
- **Adjusted prompt** — when the same fault recurs across attempts (e.g. the subject keeps drifting to the frame edge). Record the new prompt **verbatim**; the recorded prompt must always be the one that actually produced the accepted image.
- **Escalate to the Director** — if an asset fails 3 attempts, or if a category's style cannot be hit without breaking the shared language. Do not quietly relax the visual language to make one asset pass; that defeats the purpose of a proof-of-style batch.
- If an adjusted prompt is adopted, update \`scripts/generate-asset-plan.mjs\` so the change propagates to the remaining 56 approved assets rather than living only in this batch.

## 10. Provenance recording procedure

Follow \`ASSET_PROVENANCE.md\` end to end. In short, per asset:

1. Record all 14 metadata fields, including the exact prompt and the generation date captured at generation time.
2. Set \`provenanceStatus: Pending Verification\`, \`reviewerStatus: Not Reviewed\`. The file stays **outside** the repository at this point.
3. Review (§7 above). Any hard fail ⇒ Rejected/Revise.
4. Read the generating platform's terms **as of the generation date** and write the licence note. Unverifiable ⇒ Blocked, stop.
5. On acceptance: optimise, hand-write alt text describing the delivered image, commit, add a row to \`08_LICENSES.md\` §1 — with the honest status, never "copyright-free" — and only then update the content JSON \`src\`.
6. **Keep the procedural SVG.** It remains the fallback, and makes any acceptance a one-line revert.

> Recording the status as public domain, copyright-free, royalty-free or owned is prohibited (D-045). The honest register wording is in \`ASSET_PROVENANCE.md\` §1.
`,
  'utf8',
)

// --- review sheet ---
const reviewBlock = (a, i) => `### ${i + 1}. \`${a.asset_id}\` — ${a.category_name}${a.character_name ? ` / ${a.character_name}` : ' hero'}

**Verdict:** ☐ PASS ☐ REJECT ☐ REVISE ☐ BLOCKED (provenance)

| Check | Result | Note |
|---|---|---|
| Visual quality | ☐ Pass ☐ Fail | |
| Global style consistency | ☐ Pass ☐ Fail | |
| Category identity (accent ${a.category}) | ☐ Pass ☐ Fail | |
| Composition | ☐ Pass ☐ Fail | |
| Crop safety (${a.image_class}) | ☐ Pass ☐ Fail | |
| Technical defects (anatomy, artefacts) | ☐ Pass ☐ Fail | |
| Accidental text | ☐ None ☐ Found | |
| Accidental logo | ☐ None ☐ Found | |
| Accidental trademark | ☐ None ☐ Found | |
| Accidental recognisable IP | ☐ None ☐ Found | |
| Accidental real-person likeness | ☐ None ☐ Found | |
| Prompt adherence | ☐ Pass ☐ Fail | |
| Provenance recorded | ☐ Yes ☐ No | |

**Reviewer:** ______________  **Date:** ____________  **Attempt #:** ____
`

writeFileSync(
  join(DOCS, 'GEMINI_BATCH_01_REVIEW.md'),
  `# Gemini Batch 01 — Human Review Sheet (Phase 5B.1)

**Generated by \`scripts/generate-batch-01.mjs\`. Do not hand-edit the asset blocks** (re-running regenerates them); record outcomes in the tables and the summary below.

> **Status: unused.** No image has been generated, so no row below has been filled in.

## How to use this sheet

One block per asset, 14 in total. For each:

1. Work **\`AI_ASSET_REVIEW_CHECKLIST.md\`** in full — it is the authoritative gate; this sheet is the record of the outcome.
2. Do the IP checks **first**.
3. Check crop in the running UI at 375px and 1440px, not in an image viewer.
4. A single hard fail ⇒ REJECT or REVISE. Do not average across categories.

An asset marked REJECT or BLOCKED changes nothing — the procedural SVG stays in place and stays referenced. There is no half-migrated state to clean up.

## Batch-level verdict

| | |
|---|---|
| Assets reviewed | ___ / 14 |
| PASS | ___ |
| REJECT | ___ |
| REVISE | ___ |
| BLOCKED | ___ |
| **Proceed to the remaining 56 approved assets?** | ☐ Yes ☐ No ☐ Not yet — revise first |
| Reviewer | |
| Date | |

**Style-consistency check (do this once, after all 14):** place the 7 heroes side by side, then the 7 portraits. They must read as one production across seven worlds. Note any category that does not belong:

_________________________________________________________________

## Category heroes

${heroes.map(reviewBlock).join('\n')}

## Character portraits

${portraits.map((a, i) => reviewBlock(a, i + 7)).join('\n')}
`,
  'utf8',
)

console.log(`batch assets: ${batch.length} (${heroes.length} heroes, ${portraits.length} portraits)`)
console.log(`prompts extracted verbatim: ${batch.length}`)
console.log('wrote: GEMINI_BATCH_01_MANIFEST.json/.md, GEMINI_BATCH_01_EXECUTION.md, GEMINI_BATCH_01_REVIEW.md')
