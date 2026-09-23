import { useVisitorCounter } from '../../hooks/useVisitorCounter'
import styles from './VisitorCounter.module.css'

/** Simulated visitor counter (JS + localStorage), FR-041. */
export function VisitorCounter() {
  const count = useVisitorCounter()

  return (
    <span className={styles.counter}>
      <span className="visually-hidden">Visitor count: </span>
      {count.toLocaleString()} visits
    </span>
  )
}
