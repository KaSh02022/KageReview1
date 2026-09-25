import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryById } from '../data'
import { Reveal } from '../components/Reveal/Reveal'
import { EmptyState } from '../components/EmptyState/EmptyState'
import type { Article, CategoryId } from '../types/content'
import styles from './FeaturedStories.module.css'

interface FeaturedStoriesProps {
  articles: Article[]
}

/**
 * Featured editorial — one article per world.
 *
 * Takes its articles as a prop rather than reading the dataset itself, so
 * the section stays presentational and the page decides what "featured"
 * means. Renders a real empty state rather than disappearing if nothing is
 * featured.
 */
export function FeaturedStories({ articles }: FeaturedStoriesProps) {
  return (
    <Reveal as="section" aria-labelledby="featured-stories-heading" className={styles.section}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Start reading</p>
        <h2 id="featured-stories-heading" className={styles.title}>
          Featured content
        </h2>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title="No featured stories yet"
          description="Editorial picks appear here as they are published."
        />
      ) : (
        <ul className={styles.grid}>
          {articles.map((article, index) => {
            const category = getCategoryById(article.categoryId)
            const accentVar = `var(--color-accent-${(article.categoryId as CategoryId).replace('-', '')})`

            return (
              <li key={article.id} className={styles.cell}>
                <Reveal delay={index * 55}>
                  <Link
                    to={`/article/${article.id}`}
                    className={styles.card}
                    style={{ '--card-accent': accentVar } as CSSProperties}
                  >
                    <span className={styles.media}>
                      <img
                        className={styles.image}
                        src={article.thumbnail.src}
                        alt={article.thumbnail.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className={styles.body}>
                      {category && <span className={styles.category}>{category.name}</span>}
                      <span className={styles.cardTitle}>{article.title}</span>
                      <span className={styles.summary}>{article.summary}</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ul>
      )}
    </Reveal>
  )
}
