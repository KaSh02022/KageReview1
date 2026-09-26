import type { FacetGroup } from '../../features/filter/types'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  facets: FacetGroup[]
  selected: Record<FacetGroup['key'], string[]>
  onToggle: (facetKey: FacetGroup['key'], value: string) => void
  onClearFacet: (facetKey: FacetGroup['key']) => void
  onClearAll: () => void
  activeCount: number
}

/**
 * Native `<input type="checkbox">` inside a `<fieldset>`/`<legend>` per
 * facet — not custom divs — so every control is keyboard/screen-reader
 * operable for free. Each option's accessible name carries its count
 * ("Anime (12)"), and a disabled (zero-count) option still states why
 * rather than just greying out (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §8).
 */
export function FilterBar({ facets, selected, onToggle, onClearFacet, onClearAll, activeCount }: FilterBarProps) {
  return (
    <div className={styles.bar}>
      {facets.map((facet) => (
        <fieldset key={facet.key} className={styles.fieldset}>
          <div className={styles.fieldsetHeader}>
            <legend className={styles.legend}>{facet.legend}</legend>
            <button
              type="button"
              className={styles.clearFacet}
              onClick={() => onClearFacet(facet.key)}
              disabled={selected[facet.key].length === 0}
            >
              Clear {facet.legend.toLowerCase()} filters
            </button>
          </div>
          <div className={styles.options}>
            {facet.options.map((option) => {
              const isChecked = selected[facet.key].includes(option.value)
              return (
                <label
                  key={option.value}
                  className={styles.option}
                  data-disabled={option.disabled && !isChecked ? 'true' : undefined}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={option.disabled && !isChecked}
                    aria-disabled={option.disabled && !isChecked}
                    onChange={() => onToggle(facet.key, option.value)}
                  />
                  <span>
                    {option.label} ({option.count})
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
      <button type="button" className={styles.clearAll} onClick={onClearAll} disabled={activeCount === 0}>
        Clear all
      </button>
    </div>
  )
}
