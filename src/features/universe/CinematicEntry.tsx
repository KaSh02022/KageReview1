import { lazy, Suspense, useState, type MouseEvent } from 'react'
import { useWebglSupport } from '../../hooks/useWebglSupport'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport'
import { FandomCoreFallback } from './FandomCoreFallback'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'
import styles from './CinematicEntry.module.css'

// Lazy-loaded so three.js / @react-three/fiber are never in the shared
// bundle for users who land on the fallback path (~907KB chunk, confirmed
// separate from the main bundle in every build since Phase 1).
const FandomCoreScene = lazy(() => import('./FandomCoreScene'))

const CATEGORIES_SECTION_ID = 'fandom-categories-section'

/**
 * The Fandom Core — FandomVerse's original cinematic entry (Phase 4).
 * Progressive enhancement, layered, never a gate:
 *
 * 1. The page heading ("FandomVerse" h1 + tagline) sits ABOVE the visual,
 *    not overlaid on it — the orbit's first node sits exactly at top-center
 *    (docs/features/universe/fandomCoreNodes.ts angle math), so text
 *    layered over the art would either collide with a node or force an
 *    exclusion zone; a heading-above-art layout avoids that entirely and
 *    keeps the h1 unconditionally present regardless of which visual path
 *    renders underneath.
 * 2. The 2D `FandomCoreFallback` (gradient glow + ring + the shared
 *    `FandomCoreOverlay` links) is ALWAYS the base visual layer — it IS
 *    the loading state, the reduced-motion state, and the no-WebGL state,
 *    all at once, so there is never a moment with nothing to look at or
 *    interact with.
 * 3. When WebGL is supported and motion isn't reduced, the real
 *    `FandomCoreScene` canvas lazy-loads and layers on top (z-index above
 *    the gradient, below the shared HTML overlay) — if it fails to load
 *    or throws at runtime, `CanvasErrorBoundary` silently leaves the
 *    already-visible 2D fallback as the result.
 */
export function CinematicEntry() {
  const webglSupported = useWebglSupport()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobileViewport()
  const [contextLost, setContextLost] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null)

  const shouldRenderCanvas =
    webglSupported && !prefersReducedMotion && !contextLost && !canvasFailed

  function handleSkip(event: MouseEvent<HTMLAnchorElement>) {
    // Must preventDefault — with HashRouter, letting the browser follow a
    // plain `href="#id"` anchor rewrites window.location.hash to `#id`,
    // which the router then reads as an attempted route path, replacing
    // the whole page with the Not Found route. Same real bug as SkipLink
    // (D-032); fixed the same way, manual focus only, no native jump.
    event.preventDefault()
    const target = document.getElementById(CATEGORIES_SECTION_ID)
    if (!target) return
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    target.focus({ preventScroll: true })
  }

  return (
    <section className={styles.wrapper} aria-label="FandomVerse — Fandom Core">
      <div className={styles.introText}>
        <h1>FandomVerse</h1>
        <p>Portal for Fandom World</p>
      </div>

      <a href={`#${CATEGORIES_SECTION_ID}`} className={styles.skipLink} onClick={handleSkip}>
        Skip intro — jump to categories
      </a>

      <div className={styles.hero} data-testid="fandom-core-root">
        {/* Base layer: always present, IS the loading/reduced-motion/no-WebGL
            state, AND owns the one real interaction surface (its internal
            FandomCoreOverlay) — shared by both rendering paths, never
            duplicated. */}
        <FandomCoreFallback hoveredCategoryId={hoveredCategoryId} onHoverChange={setHoveredCategoryId} />

        {shouldRenderCanvas && (
          <CanvasErrorBoundary onError={() => setCanvasFailed(true)}>
            <Suspense fallback={null}>
              <FandomCoreScene
                hoveredCategoryId={hoveredCategoryId}
                reducedMotion={prefersReducedMotion}
                isMobile={isMobile}
                onContextLost={() => setContextLost(true)}
              />
            </Suspense>
          </CanvasErrorBoundary>
        )}
      </div>
    </section>
  )
}
