import { useState } from 'react'
import { Drawer } from '../ui/Drawer/Drawer'
import { Button } from '../ui/Button/Button'
import { FilterBar } from './FilterBar'
import { SortControl, type SortOption } from './SortControl'
import { ResultsSummary } from './ResultsSummary'
import type { FacetGroup, SortKey } from '../../features/filter/types'
import styles from './FilterBar.module.css'

interface ListFilterControlsProps {
  resultCount: number
  resultNoun: string
  facets: FacetGroup[]
  selected: Record<FacetGroup['key'], string[]>
  onToggle: (facetKey: FacetGroup['key'], value: string) => void
  onClearFacet: (facetKey: FacetGroup['key']) => void
  onClearAll: () => void
  activeCount: number
  sort: SortKey
  sortOptions: SortOption[]
  onSortChange: (value: SortKey) => void
}

/**
 * The "Filters (N)" trigger + sort + result count row shared by
 * Merchandise/Trailers/Events. Filters always collapse into the existing
 * `Drawer` primitive (already focus-trapped, Escape-dismissible) rather than
 * having a second, separate inline-desktop layout — one interaction pattern
 * at every width, per docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §8's "Filters
 * (2)" button-with-count convention, kept for all viewports for simplicity.
 */
export function ListFilterControls({
  resultCount,
  resultNoun,
  facets,
  selected,
  onToggle,
  onClearFacet,
  onClearAll,
  activeCount,
  sort,
  sortOptions,
  onSortChange,
}: ListFilterControlsProps) {
  const [isOpen, setOpen] = useState(false)

  return (
    <div className={styles.controls}>
      <div className={styles.controlsRow}>
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
        <SortControl value={sort} options={sortOptions} onChange={onSortChange} />
      </div>
      <ResultsSummary count={resultCount} noun={resultNoun} />

      <Drawer isOpen={isOpen} onClose={() => setOpen(false)} title="Filters" side="right">
        <FilterBar
          facets={facets}
          selected={selected}
          onToggle={onToggle}
          onClearFacet={onClearFacet}
          onClearAll={onClearAll}
          activeCount={activeCount}
        />
      </Drawer>
    </div>
  )
}
