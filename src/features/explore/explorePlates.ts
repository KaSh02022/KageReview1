/**
 * The three Kage scene plates the package ships, one per Explore landing.
 *
 * Audited rather than assumed: `public/landing-pages/secret-pathways-assets/
 * generated/` contains exactly four plates — `kage-approach`,
 * `kage-lantern-court`, `kage-moonwater` and `kage-sanmon-preview`. The fourth
 * is the hero's own preview thumbnail and stays with Chapter 00, so the three
 * landings take one distinct plate each and no plate is reused.
 *
 * Explore is the one surface where Kage visual is welcome: these pages are the
 * connective tissue of the universe rather than a particular world, so the
 * temple reads as FandomVerse's own atmosphere instead of as another
 * category's art.
 */
export const EXPLORE_PLATES = {
  trailers: 'kage-approach',
  events: 'kage-lantern-court',
  merchandise: 'kage-moonwater',
} as const

export type ExploreSurface = keyof typeof EXPLORE_PLATES
