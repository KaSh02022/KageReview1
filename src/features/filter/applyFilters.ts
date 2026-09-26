import type { CategoryId } from '../../types/content'

export interface FilterState {
  categoryIds: CategoryId[]
  statuses: string[]
}

/**
 * OR within a facet, AND across facets (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md
 * §4) — selecting Anime + Gaming and status "available" means "available items
 * in (Anime or Gaming)". Pure and generic over `T` via accessor functions,
 * rather than assuming a single shared item shape, since Merchandise/Trailers/
 * Events each have their own status field and vocabulary.
 */
export function applyFilters<T>(
  items: T[],
  filters: FilterState,
  getCategoryId: (item: T) => CategoryId,
  getStatus: (item: T) => string,
): T[] {
  return items.filter((item) => {
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(getCategoryId(item))) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(getStatus(item))) return false
    return true
  })
}
