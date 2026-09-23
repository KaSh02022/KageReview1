import { lazy, Suspense, useState } from 'react'
import { useWebglSupport } from '../../hooks/useWebglSupport'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { StaticHeroFallback } from './StaticHeroFallback'
import { LoadingState } from '../../components/LoadingState/LoadingState'
import styles from './CinematicEntry.module.css'

// Lazy-loaded so three.js / @react-three/fiber are never in the shared
// bundle for users who land on the fallback path (docs Phase 1 §15).
const MinimalScene = lazy(() => import('./MinimalScene'))

/**
 * Progressive-enhancement entry point for the cinematic "Fandom Universe"
 * layer. Phase 1 scope: detection + lazy-loading + fallback wiring only.
 * The real cinematic scene/narrative is Phase 4 (docs/10_IMPLEMENTATION_PLAN.md).
 */
export function CinematicEntry() {
  const webglSupported = useWebglSupport()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [contextLost, setContextLost] = useState(false)

  const shouldRenderCinematic = webglSupported && !prefersReducedMotion && !contextLost

  if (!shouldRenderCinematic) {
    return <StaticHeroFallback />
  }

  return (
    <Suspense
      fallback={
        // Reserves the same footprint as the loaded hero/canvas so the lazy
        // R3F chunk arriving doesn't shift the page layout (measured via a
        // real Lighthouse pass — see docs/09_TEST_STRATEGY.md §9).
        <div className={styles.hero}>
          <LoadingState label="Loading cinematic experience…" />
        </div>
      }
    >
      <MinimalScene onContextLost={() => setContextLost(true)} />
    </Suspense>
  )
}
