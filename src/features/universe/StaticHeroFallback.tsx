import styles from './CinematicEntry.module.css'

/**
 * Non-WebGL / reduced-motion fallback for the cinematic entry. Must remain
 * fully functional on its own — the 3D layer is progressive enhancement,
 * never a gate (docs/03_UX_ARCHITECTURE.md §3).
 */
export function StaticHeroFallback() {
  return (
    <div className={styles.hero} data-testid="static-hero-fallback">
      <h1>FandomVerse</h1>
      <p>Portal for Fandom World</p>
    </div>
  )
}
