import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Two real Phase 3 audit findings, fixed together since they're both
 * "what happens right after a route change" concerns:
 *
 * 1. Scroll restoration: HashRouter/React Router don't reset scroll
 *    position on navigation by default, so navigating from a scrolled-down
 *    page to a new route left the new page scrolled down too. Skipped
 *    when the URL has a hash-within-hash fragment (e.g. a future
 *    `#/article/x#section`) so in-page anchors keep working, and skipped
 *    for `prefers-reduced-motion`-safe instant scroll rather than smooth.
 * 2. Focus management: nothing moved focus after a route change, so
 *    screen-reader users got no indication navigation happened beyond
 *    whatever they were already focused on (often now-stale). Moves focus
 *    to the main content landmark — matching the skip link's existing
 *    target — without stealing focus on the *initial* page load (only on
 *    subsequent navigations), so it doesn't fight the browser's own
 *    initial-load focus behavior.
 */
export function useRouteTransitionEffects(mainContentRef: RefObject<HTMLElement | null>) {
  const location = useLocation()
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    mainContentRef.current?.focus()
    // Depends on location.pathname specifically (not the whole location
    // object) so search/hash changes on the same page (e.g. a search
    // query update) don't reset scroll/focus — only an actual route change.
  }, [location.pathname, mainContentRef])
}
