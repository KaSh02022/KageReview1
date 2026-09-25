import type { ReactNode } from 'react'
import styles from './PagePlaceholder.module.css'

interface PagePlaceholderProps {
  title: string
  description: string
  children?: ReactNode
  /**
   * A cinematic header that carries the title and the intro copy itself.
   *
   * When supplied it replaces the plain `<h1>` + paragraph below rather than
   * sitting above them, so the page keeps exactly one `<h1>` and the intro is
   * never stated twice. Every other caller is unaffected.
   */
  hero?: ReactNode
}

/**
 * Shared page header: title + intro copy, with the page body as children.
 *
 * It previously also rendered internal scaffolding — the SRS requirement
 * ids and the implementing phase — directly in the user-facing UI. A
 * Phase 5C screenshot review found "Requirements: FR-029, FR-030, FR-031"
 * rendered on the Cart page, which is project metadata no visitor should
 * ever see. Those props were removed entirely rather than merely unset, so
 * they cannot be reintroduced by a future caller.
 */
export function PagePlaceholder({ title, description, children, hero }: PagePlaceholderProps) {
  return (
    <section className={styles.wrapper}>
      {hero ?? (
        <>
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
        </>
      )}
      {children}
    </section>
  )
}
