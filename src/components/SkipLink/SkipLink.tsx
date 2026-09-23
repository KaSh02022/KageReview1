import styles from './SkipLink.module.css'

/** First focusable element on every page — accessibility foundation (docs/03_UX_ARCHITECTURE.md §13). */
export function SkipLink() {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Skip to content
    </a>
  )
}
