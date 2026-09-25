import type { CategoryId } from '../types/content'

/**
 * Landing-page art direction assets (Gemini Batch 01, Director-approved).
 *
 * WHY THIS FILE EXISTS — filename mapping, not renaming.
 * Three delivered filenames differ from the stems recorded in
 * docs/GEMINI_BATCH_01_MANIFEST.json:
 *
 *   manifest stem                     delivered file
 *   character-movies-lena-cross   ->  character-movies-det-lena-cross.png
 *   character-tv-shows-elena-marsh -> character-tv-shows-dr-elena-marsh.png
 *   character-comics-aegis        ->  character-comics-aegis-marcus-steele.png
 *
 * The assets are frozen, so nothing was renamed on disk and the manifest
 * was not edited. The difference is absorbed here instead, which keeps a
 * single place to reconcile if the pipeline later normalises the names.
 *
 * The source of truth for *which* asset belongs to a category stays
 * src/data/categories.json and src/data/characters.json — this module only
 * maps an existing category/character id to its landing artwork path.
 *
 * WHY THE RUNTIME SERVES RENDITIONS, NOT MASTERS.
 * The approved masters are 2048x2048 and 2752x1536 PNGs, 5-8 MB each. The
 * landing page shows fourteen of them, which measured at 85.9 MB of image
 * transfer for boxes no larger than 1480 CSS px. `scripts/build-web-assets.py`
 * derives resized WebP renditions into public/assets/gemini/web/ — same
 * crop, same framing, same colour, only smaller and in a lighter container —
 * bringing the same page to roughly 2 MB.
 *
 * The masters are untouched on disk in public/assets/gemini/ and in the
 * frozen staging folder _gemini_batch_01/. Setting USE_MASTERS to true
 * serves the PNGs again, so this decision is reversible in one line.
 */

const BASE = '/assets/gemini'
const WEB = `${BASE}/web`

/** Flip to true to serve the approved master PNGs instead of renditions. */
const USE_MASTERS = false

/** Master PNG filenames, keyed by the stem the rest of this file uses. */
const MASTER_FILE: Record<string, string> = {
  'hero-anime': 'hero-anime.png',
  'hero-gaming': 'hero-gaming.png',
  'hero-movies': 'hero-movies.png',
  'hero-tv-shows': 'hero-tv-shows.png',
  'hero-kpop': 'hero-kpop.png',
  'hero-comics': 'hero-comics.png',
  'hero-manga': 'hero-manga.png',
  'character-anime-kaida-nova': 'character-anime-kaida-nova.png',
  'character-gaming-kestrel-rho': 'character-gaming-kestrel-rho.png',
  'character-movies-lena-cross': 'character-movies-det-lena-cross.png',
  'character-tv-shows-elena-marsh': 'character-tv-shows-dr-elena-marsh.png',
  'character-kpop-hana': 'character-kpop-hana.png',
  'character-comics-aegis': 'character-comics-aegis-marcus-steele.png',
  'character-manga-yui-kurogane': 'character-manga-yui-kurogane.png',
}

/**
 * Resolves a stem to the path the browser should request. `variant` picks
 * the rendition width and is ignored when serving masters, since a master
 * has only one size.
 */
function assetPath(stem: string, variant: 'wide' | 'card' | 'portrait'): string {
  if (USE_MASTERS) return `${BASE}/${MASTER_FILE[stem]}`
  const suffix = variant === 'portrait' ? '' : `-${variant}`
  // Renditions are derived from the master filename, so the three mapped
  // names carry through unchanged.
  const rendition = MASTER_FILE[stem].replace(/\.png$/, '')
  return `${WEB}/${rendition}${suffix}.webp`
}

/**
 * Wide cinematic key art at full-bleed size, one per category.
 * Derived from CLASS-HERO 2752x1536 masters; rendition is 1920 wide.
 */
export const CATEGORY_HERO_ART_WIDE: Record<CategoryId, string> = {
  anime: assetPath('hero-anime', 'wide'),
  gaming: assetPath('hero-gaming', 'wide'),
  movies: assetPath('hero-movies', 'wide'),
  'tv-shows': assetPath('hero-tv-shows', 'wide'),
  kpop: assetPath('hero-kpop', 'wide'),
  comics: assetPath('hero-comics', 'wide'),
  manga: assetPath('hero-manga', 'wide'),
}

/** The same key art at category-card size. Rendition is 800 wide. */
export const CATEGORY_HERO_ART: Record<CategoryId, string> = {
  anime: assetPath('hero-anime', 'card'),
  gaming: assetPath('hero-gaming', 'card'),
  movies: assetPath('hero-movies', 'card'),
  'tv-shows': assetPath('hero-tv-shows', 'card'),
  kpop: assetPath('hero-kpop', 'card'),
  comics: assetPath('hero-comics', 'card'),
  manga: assetPath('hero-manga', 'card'),
}

/**
 * Character portraits, keyed by the character's stable id from
 * characters.json. Only the seven Batch 01 leads have real portraits;
 * every other character still uses its procedural SVG.
 */
export const CHARACTER_PORTRAIT_ART: Record<string, string> = {
  'character-anime-kaida-nova': assetPath('character-anime-kaida-nova', 'portrait'),
  'character-gaming-kestrel-rho': assetPath('character-gaming-kestrel-rho', 'portrait'),
  'character-movies-lena-cross': assetPath('character-movies-lena-cross', 'portrait'),
  'character-tv-shows-elena-marsh': assetPath('character-tv-shows-elena-marsh', 'portrait'),
  'character-kpop-hana': assetPath('character-kpop-hana', 'portrait'),
  'character-comics-aegis': assetPath('character-comics-aegis', 'portrait'),
  'character-manga-yui-kurogane': assetPath('character-manga-yui-kurogane', 'portrait'),
}

/** The seven Batch 01 leads, in the canonical category order. */
export const FEATURED_CHARACTER_IDS = [
  'character-anime-kaida-nova',
  'character-gaming-kestrel-rho',
  'character-movies-lena-cross',
  'character-tv-shows-elena-marsh',
  'character-kpop-hana',
  'character-comics-aegis',
  'character-manga-yui-kurogane',
] as const

/** Landing hero key art — the Anime world reads strongest at full bleed. */
export const LANDING_HERO_ART = CATEGORY_HERO_ART_WIDE.anime

/**
 * Returns the approved portrait for a character, falling back to the
 * procedural SVG the dataset already carries. Never returns undefined, so
 * a character without Batch 01 art still renders a real image.
 */
export function portraitFor(characterId: string, fallbackSrc: string): string {
  return CHARACTER_PORTRAIT_ART[characterId] ?? fallbackSrc
}
