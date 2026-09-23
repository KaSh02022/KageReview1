import { useClock } from '../../hooks/useClock'
import styles from './Clock.module.css'

/** Real-time clock, FR-042. */
export function Clock() {
  const now = useClock()
  const formatted = now.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <span className={styles.clock} aria-live="off" title="Current local date and time">
      {formatted}
    </span>
  )
}
