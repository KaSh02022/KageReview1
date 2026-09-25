import type { CSSProperties } from 'react'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { getCategoryById } from '../data'
import { CHAPTER_ACCENT_RGB } from '../features/landing/chapterAccents'
import { WordReveal } from '../features/landing/WordReveal'
import { Reveal } from '../components/Reveal/Reveal'
import styles from './UniverseStatement.module.css'

interface UniverseStatementProps {
  registerRef: (element: HTMLElement | null) => void
  /** Total characters in the dataset, for the closing figures. */
  characterCount: number
}

/**
 * The statement that closes the journey.
 *
 * After seven chapters each lit by its own accent, this is the page drawing
 * them back together: the seven colours resolve into one spectrum, and the
 * figures underneath are read from the live dataset rather than written into
 * the copy, so they cannot drift out of date.
 */
export function UniverseStatement({ registerRef, characterCount }: UniverseStatementProps) {
  return (
    <section
      ref={registerRef}
      tabIndex={-1}
      className={styles.section}
      aria-labelledby="universe-statement-heading"
    >
      <div className={styles.inner}>
        <Reveal className={styles.marker}>
          <span className={styles.rule} aria-hidden="true" />
          <span>One universe</span>
        </Reveal>

        <WordReveal
          id="universe-statement-heading"
          className={styles.title}
          text="Seven worlds that share a sky."
        />

        <Reveal delay={140}>
          <p className={styles.body}>
            Every character, event, release and article in FandomVerse is original fiction, written
            and drawn for this portal. Nothing here is borrowed from an existing franchise.
          </p>
        </Reveal>

        <Reveal delay={220} className={styles.spectrum}>
          {CATEGORY_ROUTES.map((route) => {
            const category = getCategoryById(route.categoryId)
            if (!category) return null
            return (
              <span
                key={route.path}
                className={styles.band}
                style={
                  { '--accent-rgb': CHAPTER_ACCENT_RGB[category.id] } as CSSProperties
                }
              >
                <span className={styles.bandLabel}>{category.name}</span>
              </span>
            )
          })}
        </Reveal>

        <Reveal delay={300}>
          <dl className={styles.figures}>
            <div className={styles.figure}>
              <dt className={styles.figureLabel}>Worlds</dt>
              <dd className={styles.figureValue}>{CATEGORY_ROUTES.length}</dd>
            </div>
            <div className={styles.figure}>
              <dt className={styles.figureLabel}>Characters</dt>
              <dd className={styles.figureValue}>{characterCount}</dd>
            </div>
            <div className={styles.figure}>
              <dt className={styles.figureLabel}>Original fiction</dt>
              <dd className={styles.figureValue}>100%</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
