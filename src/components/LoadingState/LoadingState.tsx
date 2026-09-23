import styles from './LoadingState.module.css'

interface LoadingStateProps {
  label?: string
}

/** Reusable loading placeholder for heavy media (galleries, video, 3D assets). */
export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
