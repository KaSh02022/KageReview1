import { FandomCoreOverlay, type FandomCoreOverlayProps } from './FandomCoreOverlay'
import styles from './FandomCoreFallback.module.css'

/**
 * Elegant 2D Fandom Core — the always-present base layer (loading state,
 * reduced-motion state, and no-WebGL state, all at once). Same central-glow
 * + orbit-ring concept as the 3D scene, same seven nodes (`FandomCoreOverlay`,
 * shared with the WebGL path so there is exactly one accessible
 * implementation, never duplicated). Deliberately NOT styled like an error
 * state — a soft glow, a ring, and the category nodes read as an
 * intentional design (Director's Phase 4 §10).
 *
 * Hover state is lifted to the parent (`CinematicEntry`) rather than owned
 * here, so the same hover can also highlight the matching node in the 3D
 * scene when it's layered on top.
 */
export function FandomCoreFallback({ hoveredCategoryId, onHoverChange }: FandomCoreOverlayProps) {
  return (
    <div className={styles.fallback} data-testid="fandom-core-fallback">
      <div className={styles.glowCore} />
      <div className={styles.ring} />
      <FandomCoreOverlay hoveredCategoryId={hoveredCategoryId} onHoverChange={onHoverChange} />
    </div>
  )
}
