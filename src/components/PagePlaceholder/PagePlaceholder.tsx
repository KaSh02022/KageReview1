import type { ReactNode } from 'react'
import styles from './PagePlaceholder.module.css'

interface PagePlaceholderProps {
  title: string
  description: string
  requirementIds?: string[]
  phase?: string
  children?: ReactNode
}

/**
 * Phase 1 development placeholder. Every route renders one of these (or a
 * page built on top of it) instead of a blank screen, so routing,
 * breadcrumbs, and navigation are verifiable before feature content exists
 * (Director's Phase 1 instructions, §6: "Every route must render a
 * meaningful development placeholder rather than a blank screen").
 */
export function PagePlaceholder({
  title,
  description,
  requirementIds,
  phase,
  children,
}: PagePlaceholderProps) {
  return (
    <section className={styles.wrapper}>
      <h1>{title}</h1>
      <p className={styles.description}>{description}</p>
      {(requirementIds?.length || phase) && (
        <p className={styles.meta}>
          {requirementIds?.length ? <span>Requirements: {requirementIds.join(', ')}</span> : null}
          {phase ? <span>Implemented in: {phase}</span> : null}
        </p>
      )}
      {children}
    </section>
  )
}
