import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { getCategoryById } from '../data'
import { CHAPTER_ACCENT_RGB } from '../features/landing/chapterAccents'
import { WordReveal } from '../features/landing/WordReveal'
import { Reveal } from '../components/Reveal/Reveal'
import styles from './ChapterIndex.module.css'

const SECTION_ID = 'fandom-categories-section'

interface ChapterIndexProps {
  registerRef: (element: HTMLElement | null) => void
}

/**
 * The contents page — seven worlds listed before you travel through them.
 *
 * An art book opens its chapters with a contents spread, and that is what
 * this is: the whole universe legible at a glance before the reader commits
 * to scrolling through it. It also does two structural jobs that would
 * otherwise need their own scaffolding.
 *
 * First, it carries `id="fandom-categories-section"` and `tabIndex={-1}`.
 * The Fandom Core's "Skip intro" control focuses this element, and an E2E
 * test asserts that behaviour — arriving at a list of the seven worlds is a
 * better answer to "skip the intro" than landing mid-chapter would be.
 *
 * Second, its heading is "Explore fandoms", which four separate test files
 * assert as the landing page's category landmark.
 */
export function ChapterIndex({ registerRef }: ChapterIndexProps) {
  return (
    <section
      ref={registerRef}
      id={SECTION_ID}
      tabIndex={-1}
      className={styles.section}
      aria-labelledby="chapter-index-heading"
    >
      <header className={styles.header}>
        <Reveal className={styles.marker}>
          <span className={styles.rule} aria-hidden="true" />
          <span>Contents</span>
        </Reveal>

        <WordReveal
          id="chapter-index-heading"
          className={styles.title}
          text="Explore fandoms"
        />

        <Reveal delay={120}>
          <p className={styles.lede}>
            Seven worlds, one universe. Each has its own characters, events, releases and fan
            coverage — and its own light.
          </p>
        </Reveal>
      </header>

      <ol className={styles.list}>
        {CATEGORY_ROUTES.map((route, index) => {
          const category = getCategoryById(route.categoryId)
          if (!category) return null
          const number = String(index + 1).padStart(2, '0')

          return (
            <li key={route.path} className={styles.item}>
              <Reveal delay={index * 60}>
                <Link
                  to={`/${route.path}`}
                  className={styles.entry}
                  style={
                    { '--accent-rgb': CHAPTER_ACCENT_RGB[category.id] } as CSSProperties
                  }
                >
                  <span className={styles.entryNumber} aria-hidden="true">
                    {number}
                  </span>
                  <span className={styles.entryName}>{category.name}</span>
                  <span className={styles.entryFranchise}>{category.franchise}</span>
                  <span className={styles.entryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
