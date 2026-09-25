import { useEffect, useRef, useState } from 'react'

/**
 * Reveals an element once it first enters the viewport.
 *
 * Deliberately one-shot: the observer disconnects after the first
 * intersection, so scrolling back up never replays the animation and the
 * page never accumulates live observers.
 *
 * Reduced motion is handled at the source rather than in CSS alone — when
 * the user prefers reduced motion the element starts revealed and no
 * observer is created at all, so there is no transition to suppress and no
 * work done. Browsers without IntersectionObserver are treated the same
 * way, so content is never left stranded at opacity 0.
 *
 * Matching `usePrefersReducedMotion`, the query is read once on mount; a
 * mid-session preference change applies on the next load.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number
  /** Margin around the root, e.g. reveal slightly before it scrolls in. */
  rootMargin?: string
}) {
  const ref = useRef<T | null>(null)
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window === 'undefined') return true
    // Start revealed when we could never reveal later: no matchMedia, the
    // user prefers reduced motion, or the browser has no IntersectionObserver.
    // Deciding this at initialisation avoids a setState inside the effect.
    if (typeof IntersectionObserver === 'undefined') return true
    if (!window.matchMedia) return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const threshold = options?.threshold ?? 0.15
  const rootMargin = options?.rootMargin ?? '0px 0px -8% 0px'

  useEffect(() => {
    if (isRevealed) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isRevealed, threshold, rootMargin])

  return { ref, isRevealed }
}
