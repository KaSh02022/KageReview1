import styles from './FilterBar.module.css'

interface ResultsSummaryProps {
  count: number
  noun: string
}

/** A polite live region announcing the settled result count — never fires per keystroke, only when the filtered set actually changes (docs/PHASE_6_SEARCH_FILTER_SORT_SPEC.md §8). */
export function ResultsSummary({ count, noun }: ResultsSummaryProps) {
  return (
    <p role="status" aria-live="polite" className={styles.summary}>
      {count} {count === 1 ? noun : `${noun}s`}
    </p>
  )
}
