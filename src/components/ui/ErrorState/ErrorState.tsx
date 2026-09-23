import type { ReactNode } from 'react'
import styles from './ErrorState.module.css'

export interface ErrorStateProps {
  title: string
  description?: string
  action?: ReactNode
  /** Defaults to 1 for the common case (a crashed route has no other heading on screen); pass 2/3 when embedding inside an already-headed page. */
  headingLevel?: 1 | 2 | 3
}

/**
 * Reusable "something went wrong" presentational block — extracted from
 * ErrorBoundary's inline JSX (Phase 1) so any future feature that needs an
 * inline error state (e.g. a failed client-side operation) can reuse the
 * same visual/accessible pattern instead of re-inventing it.
 */
export function ErrorState({ title, description, action, headingLevel = 1 }: ErrorStateProps) {
  const HeadingTag = `h${headingLevel}` as const

  return (
    <div className={styles.wrapper} role="alert">
      <HeadingTag className={styles.title}>{title}</HeadingTag>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.actions}>{action}</div>}
    </div>
  )
}
