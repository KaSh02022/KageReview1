import { useEffect } from 'react'

const SITE_TITLE = 'FandomVerse'

/**
 * Overrides `document.title` with the specific item's name on detail pages
 * (article/character/event/product), where the route-level `handle.title`
 * in routes.tsx is only ever the generic route label ("Article",
 * "Character", ...) since routes don't carry per-item data. Runs after
 * DocumentTitle's route-level effect on the same navigation, so this wins.
 */
export function useDynamicDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    document.title = `${SITE_TITLE} — ${title}`
  }, [title])
}
