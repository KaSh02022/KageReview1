import type { CategoryId } from '../../types/content'
import type { FacetGroup } from './types'

export interface FacetOptionSeed {
  value: string
  label: string
}

/**
 * Counts an option against the set filtered by every *other* active facet
 * (not this facet's own selection), so a zero count tells the visitor "no
 * match given your other filters" rather than always reflecting only their
 * current picks back at them. Zero-count options are disabled, not hidden,
 * so the control never reflows as filters change
 * (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §4).
 */
function buildFacet<T>(
  key: FacetGroup['key'],
  legend: string,
  seeds: FacetOptionSeed[],
  itemsForCounting: T[],
  getValue: (item: T) => string,
  selected: string[],
): FacetGroup {
  const counts = new Map<string, number>()
  for (const item of itemsForCounting) {
    const value = getValue(item)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return {
    key,
    legend,
    options: seeds.map((seed) => {
      const count = counts.get(seed.value) ?? 0
      return {
        value: seed.value,
        label: seed.label,
        count,
        disabled: count === 0 && !selected.includes(seed.value),
      }
    }),
  }
}

export function deriveCategoryFacet<T>(
  itemsFilteredByOtherFacets: T[],
  getCategoryId: (item: T) => CategoryId,
  categoryOptions: FacetOptionSeed[],
  selected: CategoryId[],
): FacetGroup {
  return buildFacet('category', 'Category', categoryOptions, itemsFilteredByOtherFacets, getCategoryId, selected)
}

export function deriveStatusFacet<T>(
  itemsFilteredByOtherFacets: T[],
  getStatus: (item: T) => string,
  statusOptions: FacetOptionSeed[],
  selected: string[],
): FacetGroup {
  return buildFacet('status', 'Status', statusOptions, itemsFilteredByOtherFacets, getStatus, selected)
}
