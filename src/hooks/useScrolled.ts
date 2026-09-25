import { useEffect, useState } from 'react'

/**
 * True once the page has scrolled past `threshold` pixels.
 *
 * Used for the header's condensed/elevated state. The scroll listener is
 * passive and does no work beyond a threshold comparison, and state is
 * only set when the boolean actually flips — so a long scroll triggers at
 * most two React renders, not one per frame.
 */
export function useScrolled(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function read() {
      setIsScrolled((previous) => {
        const next = window.scrollY > threshold
        return next === previous ? previous : next
      })
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [threshold])

  return isScrolled
}
