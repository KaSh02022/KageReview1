import { Link } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../routes/routes'
import { CinematicEntry } from '../features/universe/CinematicEntry'
import { articles, getCategoryById } from '../data'
import styles from './HomePage.module.css'

export function HomePage() {
  const featured = articles.filter((article) => article.featured)

  return (
    <div className={styles.wrapper}>
      <CinematicEntry />

      <section aria-labelledby="category-grid-heading" className={styles.section}>
        <h2 id="category-grid-heading">Explore fandoms</h2>
        <div className={styles.categoryGrid}>
          {CATEGORY_ROUTES.map((category) => {
            const meta = getCategoryById(category.categoryId)
            return (
              <Link key={category.path} to={`/${category.path}`} className={styles.categoryCard}>
                <h3>{category.label}</h3>
                {meta && <p>{meta.tagline}</p>}
              </Link>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="featured-heading" className={styles.section}>
        <h2 id="featured-heading">Featured content</h2>
        {featured.length === 0 ? (
          <p>No featured content yet — full content population happens in later phases.</p>
        ) : (
          <ul className={styles.featuredList}>
            {featured.map((article) => (
              <li key={article.id}>
                <Link to={`/article/${article.id}`}>{article.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
