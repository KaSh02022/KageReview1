import type { MouseEvent } from 'react'
import styles from './SkipLink.module.css'

/**
 * First focusable element on every page — accessibility foundation
 * (docs/03_UX_ARCHITECTURE.md §13).
 *
 * The click handler calls `preventDefault()` and focuses `#main-content`
 * directly via JS, rather than letting the browser follow the plain
 * `href="#main-content"` anchor jump. In a `HashRouter` app, the browser's
 * native same-page-anchor navigation rewrites `window.location.hash` to
 * `#main-content`, which the router then reads as an attempted route path
 * ("main-content" doesn't match any real route) — silently replacing the
 * current page with the Not Found page. This was a real bug, present
 * since Phase 1, found during Phase 4 E2E testing (docs/11_DECISION_LOG.md
 * D-032): the most basic keyboard-accessibility affordance in the entire
 * app was throwing users onto a 404 screen.
 */
export function SkipLink() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document.getElementById('main-content')?.focus()
  }

  return (
    <a href="#main-content" className={styles.skipLink} onClick={handleClick}>
      Skip to content
    </a>
  )
}
