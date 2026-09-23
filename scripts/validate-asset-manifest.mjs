// Phase 5B — asset manifest validator.
//
// Guards the planning artifacts against drift. The manifest is generated
// from the content dataset, so if content changes and the plan is not
// regenerated, this fails loudly rather than leaving a stale prompt or an
// asset with no home.
//
// Run: node scripts/validate-asset-manifest.mjs
// Also asserted from src/data/assetManifest.test.ts so it runs in CI.

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

export function validateAssetManifest() {
  const errors = []
  const manifestPath = join(ROOT, 'docs', 'asset-manifest.json')

  if (!existsSync(manifestPath)) {
    return ['docs/asset-manifest.json is missing — run `node scripts/generate-asset-plan.mjs`']
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const readData = (name) => JSON.parse(readFileSync(join(ROOT, 'src', 'data', name), 'utf8'))
  const categories = readData('categories.json')
  const characters = readData('characters.json')
  const galleries = readData('galleries.json')
  const articles = readData('articles.json')
  const media = readData('media.json')
  const releases = readData('releases.json')
  const merchandise = readData('merchandise.json')
  const events = readData('events.json')

  const assets = manifest.assets ?? []
  const byTier = (tier) => assets.filter((a) => a.tier === tier)

  // --- structural ---
  const ids = assets.map((a) => a.assetId)
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicates.length) errors.push(`duplicate asset ids: ${[...new Set(duplicates)].join(', ')}`)

  const categoryIds = new Set(categories.map((c) => c.id))
  for (const asset of assets) {
    if (!categoryIds.has(asset.categoryId)) {
      errors.push(`${asset.assetId} points at unknown category "${asset.categoryId}"`)
    }
    if (!manifest.imageClasses[asset.imageClass]) {
      errors.push(`${asset.assetId} uses unknown image class "${asset.imageClass}"`)
    }
    if (!manifest.tiers[asset.tier]) {
      errors.push(`${asset.assetId} uses unknown tier "${asset.tier}"`)
    }
  }

  // --- coverage: every catalogued asset must correspond to real content ---
  const expected = {
    'category-hero': categories.length,
    'character-portrait': characters.length,
    'gallery-artwork': galleries.reduce((n, g) => n + g.images.length, 0),
    'article-thumbnail': articles.length,
    'trailer-thumbnail': media.length,
    'release-artwork': releases.length,
    'merchandise-artwork': merchandise.length,
    'event-visual': events.length,
  }
  for (const [type, count] of Object.entries(expected)) {
    const actual = assets.filter((a) => a.assetType === type).length
    if (actual !== count) {
      errors.push(
        `asset type "${type}": manifest has ${actual}, content data has ${count} — regenerate the plan`,
      )
    }
  }

  const totalContentAssets = Object.values(expected).reduce((a, b) => a + b, 0)
  if (assets.length !== totalContentAssets) {
    errors.push(`manifest catalogues ${assets.length} assets but content data has ${totalContentAssets}`)
  }

  // --- replacement targets must name a real, currently-shipping asset ---
  const shippingSources = new Set([
    ...categories.map((c) => c.heroImage.src),
    ...characters.map((c) => c.image.src),
    ...galleries.flatMap((g) => g.images.map((i) => i.src)),
    ...articles.map((a) => a.thumbnail.src),
    ...media.map((m) => m.thumbnail.src),
    ...releases.map((r) => r.coverImage.src),
    ...merchandise.map((m) => m.image.src),
    ...events.map((e) => e.image.src),
  ])
  for (const asset of assets) {
    if (asset.replaces && !shippingSources.has(asset.replaces)) {
      errors.push(`${asset.assetId} claims to replace "${asset.replaces}", which is not a shipping asset`)
    }
    if (asset.replaces && !existsSync(join(ROOT, 'public', asset.replaces))) {
      errors.push(`${asset.assetId} replacement target "${asset.replaces}" is not on disk`)
    }
  }

  // --- the plan must stay a plan in this phase ---
  for (const asset of [...byTier('B'), ...byTier('C')]) {
    if (shippingSources.has(`/assets/generated/${asset.filename}`)) {
      errors.push(`${asset.assetId}: a generated filename is already referenced by runtime data`)
    }
  }

  // --- prompts doc must cover exactly the approved set ---
  const promptsPath = join(ROOT, 'docs', 'GEMINI_IMAGE_PROMPTS.md')
  if (!existsSync(promptsPath)) {
    errors.push('docs/GEMINI_IMAGE_PROMPTS.md is missing — run `node scripts/generate-asset-plan.mjs`')
  } else {
    const prompts = readFileSync(promptsPath, 'utf8')
    for (const asset of byTier('B')) {
      if (!prompts.includes(`### \`${asset.assetId}\``)) {
        errors.push(`${asset.assetId} is approved (Tier B) but has no prompt in GEMINI_IMAGE_PROMPTS.md`)
      }
    }
    for (const asset of byTier('C')) {
      if (prompts.includes(`### \`${asset.assetId}\``)) {
        errors.push(`${asset.assetId} is deferred (Tier C) but a prompt was written for it`)
      }
    }
  }

  errors.push(...validateBatch01(assets))
  return errors
}

/**
 * Phase 5B.1 — Gemini Batch 01 (proof-of-style) checks. The batch is a
 * strict subset of the approved Tier B set, so it must never drift from
 * it, never reference a content id that no longer exists, and never
 * quietly become a runtime integration.
 */
function validateBatch01(approvedAssets) {
  const errors = []
  const batchPath = join(ROOT, 'docs', 'GEMINI_BATCH_01_MANIFEST.json')
  if (!existsSync(batchPath)) {
    return ['docs/GEMINI_BATCH_01_MANIFEST.json is missing — run `node scripts/generate-batch-01.mjs`']
  }

  const batch = JSON.parse(readFileSync(batchPath, 'utf8'))
  const assets = batch.assets ?? []
  const readData = (name) => JSON.parse(readFileSync(join(ROOT, 'src', 'data', name), 'utf8'))
  const categories = readData('categories.json')
  const characters = readData('characters.json')

  const heroes = assets.filter((a) => a.asset_type === 'category-hero')
  const portraits = assets.filter((a) => a.asset_type === 'character-portrait')

  if (assets.length !== 14) errors.push(`batch 01: expected 14 assets, found ${assets.length}`)
  if (heroes.length !== 7) errors.push(`batch 01: expected 7 category heroes, found ${heroes.length}`)
  if (portraits.length !== 7) errors.push(`batch 01: expected 7 character portraits, found ${portraits.length}`)
  if (new Set(assets.map((a) => a.asset_id)).size !== assets.length) errors.push('batch 01: duplicate asset_id')
  if (new Set(assets.map((a) => a.filename)).size !== assets.length) errors.push('batch 01: duplicate filename')
  if (new Set(heroes.map((a) => a.category)).size !== heroes.length)
    errors.push('batch 01: heroes do not cover distinct categories')
  if (new Set(portraits.map((a) => a.category)).size !== portraits.length)
    errors.push('batch 01: portraits do not cover distinct categories')
  if (batch.images_generated !== 0) errors.push('batch 01: images_generated must be 0 in this phase')

  const approvedIds = new Set(approvedAssets.filter((a) => a.tier === 'B').map((a) => a.assetId))
  const promptsPath = join(ROOT, 'docs', 'GEMINI_IMAGE_PROMPTS.md')
  const prompts = existsSync(promptsPath) ? readFileSync(promptsPath, 'utf8') : ''
  const execPath = join(ROOT, 'docs', 'GEMINI_BATCH_01_EXECUTION.md')
  const execution = existsSync(execPath) ? readFileSync(execPath, 'utf8') : ''
  if (!execution) errors.push('docs/GEMINI_BATCH_01_EXECUTION.md is missing')

  for (const asset of assets) {
    if (!approvedIds.has(asset.asset_id)) {
      errors.push(`batch 01: ${asset.asset_id} is not an approved Tier B asset`)
    }
    if (asset.status !== 'READY_FOR_GEMINI') {
      errors.push(`batch 01: ${asset.asset_id} has status "${asset.status}"`)
    }
    if (!prompts.includes(`### \`${asset.asset_id}\``)) {
      errors.push(`batch 01: ${asset.asset_id} has no prompt in GEMINI_IMAGE_PROMPTS.md`)
    }
    if (execution && !execution.includes(`### ${assets.indexOf(asset) + 1}. \`${asset.asset_id}\``)) {
      errors.push(`batch 01: ${asset.asset_id} is missing from the execution guide`)
    }
    // The prompt carried in the batch must be the approved one, verbatim.
    if (prompts && asset.prompt && !prompts.includes(asset.prompt)) {
      errors.push(`batch 01: ${asset.asset_id} prompt does not match GEMINI_IMAGE_PROMPTS.md verbatim`)
    }
    if (asset.prompt && !asset.prompt.includes('NEGATIVE CONSTRAINTS:')) {
      errors.push(`batch 01: ${asset.asset_id} prompt is missing its negative constraint block`)
    }
    if (asset.prompt && !asset.prompt.includes('CRITICAL:')) {
      errors.push(`batch 01: ${asset.asset_id} prompt is missing its crop constraint`)
    }
    // Source content must still exist under its stable id.
    if (asset.source_content_kind === 'character') {
      if (!characters.some((c) => c.id === asset.source_content_id)) {
        errors.push(`batch 01: ${asset.asset_id} references missing character "${asset.source_content_id}"`)
      }
    } else if (!categories.some((c) => c.id === asset.source_content_id)) {
      errors.push(`batch 01: ${asset.asset_id} references missing category "${asset.source_content_id}"`)
    }
  }

  return errors
}

// Run directly (not when imported by the test).
if (process.argv[1] && process.argv[1].endsWith('validate-asset-manifest.mjs')) {
  const errors = validateAssetManifest()
  if (errors.length) {
    console.error(`asset manifest INVALID (${errors.length} problem${errors.length === 1 ? '' : 's'}):`)
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }
  console.log('asset manifest OK')
}
