import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

interface RouteHandle {
  title?: string | null
}

const SITE_TITLE = 'FandomVerse'
const HOME_TITLE = 'FandomVerse — Portal for Fandom World'

/**
 * Sets `document.title` per route, derived from route match data
 * (`handle.title` in src/routes/routes.tsx) via the same `useMatches()`
 * pattern already proven for Breadcrumb — one source of truth for the
 * page's identity, not hand-maintained per page component.
 *
 * Convention (docs/02_PRODUCT_ARCHITECTURE.md §14): "FandomVerse — Portal
 * for Fandom World" on Home, "FandomVerse — <Page>" everywhere else, so
 * routes are distinguishable in browser tabs/history/bookmarks (a real
 * gap found in the Phase 3 audit — every route previously showed the same
 * static `index.html` title).
 */
export function DocumentTitle() {
  const matches = useMatches()

  useEffect(() => {
    const deepestWithTitle = [...matches]
      .reverse()
      .find((match) => (match.handle as RouteHandle | undefined)?.title !== undefined)
    const title = (deepestWithTitle?.handle as RouteHandle | undefined)?.title

    document.title = title ? `${SITE_TITLE} — ${title}` : HOME_TITLE
  }, [matches])

  return null
}
