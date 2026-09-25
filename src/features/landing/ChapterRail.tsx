import styles from './ChapterRail.module.css'

export interface RailEntry {
  /** Index in the chapter progress space. */
  index: number
  /** Two-digit chapter number, e.g. "03". */
  number: string
  /** Category name, announced to assistive tech. */
  label: string
  /** CSS colour for the active state. */
  accent: string
}

interface ChapterRailProps {
  entries: RailEntry[]
  activeIndex: number
  onSelect: (index: number) => void
}

/**
 * The chapter rail — a reader's position in the universe, and a way to move.
 *
 * Buttons rather than anchors, deliberately. This app runs on a hash router,
 * where a real `href="#chapter-3"` rewrites `location.hash` and the router
 * reads it as an attempted route, replacing the page with Not Found (D-032).
 * The rail scrolls and moves focus itself instead.
 *
 * It is a real `<nav>` with real buttons, so it is tabbable, operable with
 * Enter and Space for free, and reachable in a screen reader's landmark
 * list. `aria-current` marks the chapter being read.
 */
export function ChapterRail({ entries, activeIndex, onSelect }: ChapterRailProps) {
  return (
    <nav className={styles.rail} aria-label="Chapters">
      <ol className={styles.list}>
        {entries.map((entry) => {
          const isActive = entry.index === activeIndex
          return (
            <li key={entry.index} className={styles.item}>
              <button
                type="button"
                className={`${styles.button} ${isActive ? styles.active : ''}`}
                style={{ '--rail-accent': entry.accent } as React.CSSProperties}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(entry.index)}
              >
                <span className={styles.number} aria-hidden="true">
                  {entry.number}
                </span>
                <span className={styles.tick} aria-hidden="true" />
                <span className={styles.label}>{entry.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
