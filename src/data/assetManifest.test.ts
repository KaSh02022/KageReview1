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

  it('leaves the shipping data untouched — this phase plans, it does not swap assets', () => {
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
