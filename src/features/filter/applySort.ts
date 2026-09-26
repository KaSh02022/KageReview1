import type { SortKey } from './types'

export interface SortAccessors<T> {
  getTitle: (item: T) => string
  /** Omit for item types with no date field (e.g. merchandise) — newest/oldest then behave as A–Z. */
  getDate?: (item: T) => string | undefined
}

function dateMillis<T>(item: T, getDate?: (item: T) => string | undefined): number | null {
  const raw = getDate?.(item)
  if (!raw) return null
  const millis = new Date(raw).getTime()
  return Number.isNaN(millis) ? null : millis
}

/**
 * Undated items sort last, deterministically by title, rather than being
 * silently dropped or left in input order (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §5).
 */
export function applySort<T>(items: T[], sort: SortKey, accessors: SortAccessors<T>): T[] {
  const { getTitle, getDate } = accessors
  const sorted = [...items]

  switch (sort) {
    case 'az':
      sorted.sort((a, b) => getTitle(a).localeCompare(getTitle(b)))
      break
    case 'za':
      sorted.sort((a, b) => getTitle(b).localeCompare(getTitle(a)))
      break
    case 'newest':
      sorted.sort((a, b) => {
        const da = dateMillis(a, getDate)
        const db = dateMillis(b, getDate)
        if (da === null && db === null) return getTitle(a).localeCompare(getTitle(b))
        if (da === null) return 1
        if (db === null) return -1
        return db - da
      })
      break
    case 'oldest':
      sorted.sort((a, b) => {
        const da = dateMillis(a, getDate)
        const db = dateMillis(b, getDate)
        if (da === null && db === null) return getTitle(a).localeCompare(getTitle(b))
        if (da === null) return 1
        if (db === null) return -1
        return da - db
      })
      break
  }

  return sorted
}
