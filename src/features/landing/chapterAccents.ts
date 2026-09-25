import type { CategoryId } from '../../types/content'

/**
 * Category accents as `r, g, b` triplets.
 *
 * The canvas needs channel numbers to build `rgba(...)` per mote at varying
 * alpha, which a `var(--color-accent-*)` hex cannot provide from script
 * without a getComputedStyle read every frame. These mirror the canonical
 * tokens in src/styles/tokens.css and must be kept in step with them.
 */
export const CHAPTER_ACCENT_RGB: Record<CategoryId, string> = {
  anime: '255, 93, 115',
  gaming: '51, 208, 255',
  movies: '255, 182, 72',
  'tv-shows': '143, 123, 255',
  kpop: '255, 93, 224',
  comics: '255, 225, 77',
  manga: '92, 230, 166',
}

/** The intro is not a category; it takes the brand primary. */
export const INTRO_ACCENT_RGB = '124, 141, 255'
