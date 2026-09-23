import type { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

export interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  /** Defaults to h2 since SectionHeader marks a sub-section of a page whose h1 is the page title. */
  level?: 2 | 3
  id?: string
}

/** Consistent "eyebrow + title + description + optional action" heading block, used across Home's sections and every future category-hub section. */
export function SectionHeader({ eyebrow, title, description, action, level = 2, id }: SectionHeaderProps) {
  const HeadingTag = level === 2 ? 'h2' : 'h3'

  return (
    <div className={styles.wrapper}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <HeadingTag id={id} className={styles.title}>
          {title}
        </HeadingTag>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
