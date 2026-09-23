import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './Form.module.css'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visually hidden but always present — every input needs an accessible name. */
  label: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { label, id, className, ...rest },
  ref,
) {
  return (
    <div className={styles.searchInputWrapper}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className={styles.searchIcon} aria-hidden="true">
        🔎
      </span>
      <input
        ref={ref}
        id={id}
        type="search"
        className={[styles.input, styles.searchInput, className].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
})
