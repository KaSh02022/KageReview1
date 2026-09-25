import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { getCategoryById } from '../data'
import { CATEGORY_HERO_ART } from '../data/landingAssets'
import { Reveal } from '../components/Reveal/Reveal'
import type { CategoryId } from '../types/content'
import styles from './CategoryExplorer.module.css'

const SECTION_ID = 'fandom-categories-section'

/**
 * The seven worlds, each with its own key art and accent.
 *
 * Keeps `id="fandom-categories-section"` and `tabIndex={-1}`: the Fandom
 * Core's "Skip intro" control focuses this element, and an E2E test
 * asserts that behaviour (D-032's regression coverage).
 *
 * The accent is applied as a CSS custom property per card rather than a
 * per-category class, so all seven share one rule set — one design system,
 * seven accents, exactly as the design docs require.
 */
export function CategoryExplorer() {
  return (
    <Reveal
      as="section"
      id={SECTION_ID}
      aria-labelledby="category-grid-heading"
      className={styles.section}
      // Focus target for the hero's skip control — not in the tab order.
      {...{ tabIndex: -1 }}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Seven worlds, one portal</p>
        <h2 id="category-grid-heading" className={styles.title}>
          Explore fandoms
        </h2>
        <p className={styles.lede}>
          Every world has its own characters, events, releases and fan coverage — and its own light.
        </p>
      </header>

      <ul className={styles.grid}>
        {CATEGORY_ROUTES.map((route, index) => {
          const category = getCategoryById(route.categoryId)
          if (!category) return null
          const accentVar = `var(--color-accent-${(category.id as CategoryId).replace('-', '')})`

          return (
            <li key={route.path} className={styles.cell}>
              <Reveal delay={index * 70}>
                <Link
                  to={`/${route.path}`}
                  className={styles.card}
                  style={{ '--card-accent': accentVar } as CSSProperties}
                >
                  <span className={styles.media}>
                    <img
                      className={styles.image}
                      src={CATEGORY_HERO_ART[category.id]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.mediaScrim} aria-hidden="true" />
                  </span>

                  <span className={styles.body}>
                    <span className={styles.name}>{category.name}</span>
                    <span className={styles.franchise}>{category.franchise}</span>
                    <span className={styles.tagline}>{category.tagline}</span>
                  </span>

                  <span className={styles.enter} aria-hidden="true">
                    <span className={styles.enterLabel}>Enter</span>
                    <span className={styles.enterArrow}>→</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Reveal>
  )
}
