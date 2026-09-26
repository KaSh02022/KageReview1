import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CategoryId } from '../../types/content'
import type { SortKey } from './types'

/**
 * All filter/sort state lives in the URL query string — no store, no
 * component state as source of truth — so a filtered view is shareable,
 * survives reload, and works with back/forward
 * (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §6). `useSearchParams` reads and
 * writes the query string *inside* the hash under HashRouter, the same
 * mechanism `/search?q=` already relies on (proven by
 * e2e/deep-links.spec.ts) — never `window.location.search` directly, which
 * under HashRouter is the wrong (pre-hash) string.
 *
 * `replace: true` on every update so toggling filters doesn't pile up
 * history entries — back/forward should step between pages, not filter
 * clicks.
 */
export function useListFilterState(defaultSort: SortKey) {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryIds = useMemo(
    () => (searchParams.get('category')?.split(',').filter(Boolean) ?? []) as CategoryId[],
    [searchParams],
  )
  const statuses = useMemo(
    () => searchParams.get('status')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )
  const sort = (searchParams.get('sort') as SortKey | null) ?? defaultSort

  const update = useCallback(
    (next: { category?: string[]; status?: string[]; sort?: SortKey }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          if (next.category !== undefined) {
            if (next.category.length > 0) params.set('category', next.category.join(','))
            else params.delete('category')
          }
          if (next.status !== undefined) {
            if (next.status.length > 0) params.set('status', next.status.join(','))
            else params.delete('status')
          }
          if (next.sort !== undefined) {
            if (next.sort !== defaultSort) params.set('sort', next.sort)
            else params.delete('sort')
          }
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams, defaultSort],
  )

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      update({
        category: categoryIds.includes(id) ? categoryIds.filter((c) => c !== id) : [...categoryIds, id],
      })
    },
    [categoryIds, update],
  )

  const toggleStatus = useCallback(
    (value: string) => {
      update({
        status: statuses.includes(value) ? statuses.filter((s) => s !== value) : [...statuses, value],
      })
    },
    [statuses, update],
  )

  const clearCategory = useCallback(() => update({ category: [] }), [update])
  const clearStatus = useCallback(() => update({ status: [] }), [update])
  const clearAll = useCallback(() => update({ category: [], status: [], sort: defaultSort }), [update, defaultSort])
  const setSort = useCallback((next: SortKey) => update({ sort: next }), [update])

  const activeCount = categoryIds.length + statuses.length

  return {
    categoryIds,
    statuses,
    sort,
    activeCount,
    toggleCategory,
    toggleStatus,
    clearCategory,
    clearStatus,
    clearAll,
    setSort,
  }
}
