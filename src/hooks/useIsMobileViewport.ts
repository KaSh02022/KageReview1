import { useEffect, useState } from 'react'
import { BREAKPOINTS } from '../styles/breakpoints'

const QUERY = `(max-width: ${BREAKPOINTS.mobileMax}px)`

function getInitial(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/**
 * Tracks the canonical mobile breakpoint (docs/04_DESIGN_SYSTEM.md §2a),
 * used by the Fandom Core scene to scale down starfield count/parallax
 * strength (Phase 4 §12 mobile guardrails) — not a second breakpoint
 * system, the same 599px boundary as everywhere else.
 */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(getInitial)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia(QUERY)
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
