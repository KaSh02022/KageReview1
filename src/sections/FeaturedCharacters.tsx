import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { characters, getCategoryById } from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { FEATURED_CHARACTER_IDS, portraitFor } from '../data/landingAssets'
import { Reveal } from '../components/Reveal/Reveal'
import type { CategoryId } from '../types/content'
import styles from './FeaturedCharacters.module.css'

/**
 * The seven Batch 01 leads — one per world.
 *
 * Driven by `FEATURED_CHARACTER_IDS` (the ids that actually have approved
 * portrait art) and resolved against `characters.json`, so a character
 * whose art is missing still renders with its procedural SVG rather than a
 * broken image. Any id that no longer exists in the dataset is skipped
 * instead of rendering an empty card.
 */
export function FeaturedCharacters() {
  const featured = FEATURED_CHARACTER_IDS.map((id) =>
    characters.find((character) => character.id === id),
  ).filter((character): character is NonNullable<typeof character> => Boolean(character))

  if (featured.length === 0) return null

  return (
    <Reveal as="section" aria-labelledby="featured-characters-heading" className={styles.section}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Faces of the universe</p>
        <h2 id="featured-characters-heading" className={styles.title}>
          Meet the leads
        </h2>
        <p className={styles.lede}>
          One character from each world. Every profile is original fiction created for FandomVerse.
        </p>
      </header>

      <ul className={styles.grid}>
        {featured.map((character, index) => {
          const category = getCategoryById(character.categoryId)
          const route = CATEGORY_ROUTES.find((item) => item.categoryId === character.categoryId)
          const accentVar = `var(--color-accent-${(character.categoryId as CategoryId).replace('-', '')})`

          return (
            <li key={character.id} className={styles.cell}>
              <Reveal delay={index * 60}>
                <Link
                  to={`/character/${character.id}`}
                  className={styles.card}
                  style={{ '--card-accent': accentVar } as CSSProperties}
                >
                  <span className={styles.portraitFrame}>
                    <img
                      className={styles.portrait}
                      src={portraitFor(character.id, character.image.src)}
                      alt={character.image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.portraitScrim} aria-hidden="true" />
                    {category && route && <span className={styles.badge}>{category.name}</span>}
                  </span>

                  <span className={styles.info}>
                    <span className={styles.name}>{character.name}</span>
                    <span className={styles.role}>{character.role}</span>
                    <span className={styles.series}>{character.series}</span>
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
