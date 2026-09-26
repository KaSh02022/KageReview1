import { useId } from 'react'
import type { SortKey } from '../../features/filter/types'
import formStyles from '../ui/Form/Form.module.css'

export interface SortOption {
  value: SortKey
  label: string
  disabled?: boolean
}

interface SortControlProps {
  value: SortKey
  options: SortOption[]
  onChange: (value: SortKey) => void
}

/** Native `<select>` + real label — unavailable options are disabled, not hidden, and state its reason via the label text of the option itself (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §8). */
export function SortControl({ value, options, onChange }: SortControlProps) {
  const id = useId()

  return (
    <div className={formStyles.field}>
      <label htmlFor={id} className={formStyles.label}>
        Sort by
      </label>
      <select
        id={id}
        className={formStyles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
