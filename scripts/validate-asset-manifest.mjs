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
