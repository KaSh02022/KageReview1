import { describe, it, expect } from 'vitest'
// @ts-expect-error -- plain .mjs tooling module, intentionally outside the app's typed source
import { validateAssetManifest } from '../../scripts/validate-asset-manifest.mjs'
import { categories, characters, galleries } from './index'

/**
 * Phase 5B planning-artifact gate. The Gemini asset manifest and prompt
 * document are generated from the content dataset, so they can silently go
 * stale the moment content changes. This runs the same validator as
 * `node scripts/validate-asset-manifest.mjs` in CI, and additionally pins
 * the approved scope so nobody quietly widens an expensive generation pass.
 */

interface ManifestAsset {
  assetId: string
  categoryId: string
  assetType: string
  imageClass: string
  tier: string
  replaces: string | null
}

const manifest = (await import('../../docs/asset-manifest.json')).default as unknown as {
  counts: Record<string, number>
  assets: ManifestAsset[]
}

const tier = (t: string) => manifest.assets.filter((asset) => asset.tier === t)

describe('Gemini asset manifest', () => {
  it('passes the manifest validator (no drift from the content dataset)', () => {
    expect(validateAssetManifest()).toEqual([])
  })

  it('catalogues every currently shipping procedural asset exactly once', () => {
    expect(manifest.assets).toHaveLength(161)
    expect(manifest.counts.currentProceduralAssets).toBe(161)
  })

  it('approves only the three high-value asset types (heroes, characters, gallery)', () => {
    const approvedTypes = new Set(tier('B').map((asset) => asset.assetType))
    expect([...approvedTypes].sort()).toEqual(['category-hero', 'character-portrait', 'gallery-artwork'])
  })

  it('approves one hero per category, one portrait per character, one piece per gallery image', () => {
    const galleryImageCount = galleries.reduce((total, gallery) => total + gallery.images.length, 0)
    expect(tier('B').filter((a) => a.assetType === 'category-hero')).toHaveLength(categories.length)
    expect(tier('B').filter((a) => a.assetType === 'character-portrait')).toHaveLength(characters.length)
    expect(tier('B').filter((a) => a.assetType === 'gallery-artwork')).toHaveLength(galleryImageCount)
  })

  it('keeps merchandise and event art procedural by decision, not by omission', () => {
    const keptTypes = new Set(tier('A').map((asset) => asset.assetType))
    expect([...keptTypes].sort()).toEqual(['event-visual', 'merchandise-artwork'])
    expect(tier('A').every((asset) => asset.replaces === null)).toBe(true)
  })

  it('leaves the shipping data untouched — these phases plan, they do not swap assets', () => {
    // Every runtime asset reference must still be a Phase 5 procedural SVG.
    const runtimeSources = [
      ...categories.map((c) => c.heroImage.src),
      ...characters.map((c) => c.image.src),
      ...galleries.flatMap((g) => g.images.map((i) => i.src)),
    ]
    expect(runtimeSources.every((src) => src.endsWith('.svg'))).toBe(true)
    expect(runtimeSources.some((src) => src.endsWith('.webp'))).toBe(false)
  })
})

interface BatchAsset {
  asset_id: string
  category: string
  asset_type: string
  source_content_id: string
  source_content_kind: string
  filename: string
  prompt: string
  status: string
}

const batch01 = (await import('../../docs/GEMINI_BATCH_01_MANIFEST.json')).default as unknown as {
  images_generated: number
  asset_count: number
  assets: BatchAsset[]
}

describe('Gemini Batch 01 (proof-of-style)', () => {
  it('contains exactly 14 assets — 7 heroes and 7 character portraits', () => {
    expect(batch01.assets).toHaveLength(14)
    expect(batch01.assets.filter((a) => a.asset_type === 'category-hero')).toHaveLength(7)
    expect(batch01.assets.filter((a) => a.asset_type === 'character-portrait')).toHaveLength(7)
  })

  it('covers all seven categories in both classes, with no duplicates', () => {
    const heroes = batch01.assets.filter((a) => a.asset_type === 'category-hero')
    const portraits = batch01.assets.filter((a) => a.asset_type === 'character-portrait')
    const expected = categories.map((c) => c.id).sort()
    expect(heroes.map((a) => a.category).sort()).toEqual(expected)
    expect(portraits.map((a) => a.category).sort()).toEqual(expected)
    expect(new Set(batch01.assets.map((a) => a.asset_id)).size).toBe(14)
    expect(new Set(batch01.assets.map((a) => a.filename)).size).toBe(14)
  })

  it('references only stable ids that exist in the live dataset', () => {
    for (const asset of batch01.assets) {
      if (asset.source_content_kind === 'character') {
        expect(
          characters.some((c) => c.id === asset.source_content_id),
          `${asset.asset_id} -> ${asset.source_content_id}`,
        ).toBe(true)
      } else {
        expect(
          categories.some((c) => c.id === asset.source_content_id),
          `${asset.asset_id} -> ${asset.source_content_id}`,
        ).toBe(true)
      }
    }
  })

  it('carries a complete prompt with IP and crop constraints for every asset', () => {
    for (const asset of batch01.assets) {
      expect(asset.prompt.length, asset.asset_id).toBeGreaterThan(400)
      expect(asset.prompt, asset.asset_id).toContain('NEGATIVE CONSTRAINTS:')
      expect(asset.prompt, asset.asset_id).toContain('CRITICAL:')
      expect(asset.prompt, asset.asset_id).toContain('no logos')
      expect(asset.prompt, asset.asset_id).toContain('no recognisable real person')
      expect(asset.status).toBe('READY_FOR_GEMINI')
    }
  })

  it('records that no image has been generated and nothing is wired to runtime', () => {
    expect(batch01.images_generated).toBe(0)
    expect(batch01.asset_count).toBe(14)
  })
})
