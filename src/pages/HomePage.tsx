import { CATEGORY_ROUTES } from '../routes/routes'
import { CinematicEntry } from '../features/universe/CinematicEntry'
import { articles, getCategoryById } from '../data'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardHeader, CardBody } from '../components/ui/Card/Card'
import { EmptyState } from '../components/EmptyState/EmptyState'
import styles from './HomePage.module.css'

const CATEGORY_ACCENT_VAR: Record<string, string> = {
  anime: 'var(--color-accent-anime)',
  gaming: 'var(--color-accent-gaming)',
  movies: 'var(--color-accent-movies)',
  'tv-shows': 'var(--color-accent-tvshows)',
  'k-pop': 'var(--color-accent-kpop)',
  comics: 'var(--color-accent-comics)',
  manga: 'var(--color-accent-manga)',
}

export function HomePage() {
  const featured = articles.filter((article) => article.featured)

  return (
    <div className={styles.wrapper}>
      <CinematicEntry />

      <section aria-labelledby="category-grid-heading">
        <SectionHeader
          id="category-grid-heading"
          eyebrow="Seven worlds, one portal"
          title="Explore fandoms"
        />
        <Grid minItemWidth={200} gap="md">
          {CATEGORY_ROUTES.map((category) => {
            const meta = getCategoryById(category.categoryId)
            return (
              <Card key={category.path} to={`/${category.path}`} accent={CATEGORY_ACCENT_VAR[category.path]}>
                <CardHeader>
                  <h3>{category.label}</h3>
                </CardHeader>
                {meta && <CardBody>{meta.tagline}</CardBody>}
              </Card>
            )
          })}
        </Grid>
      </section>

      <section aria-labelledby="featured-heading">
        <SectionHeader id="featured-heading" title="Featured content" />
        {featured.length === 0 ? (
          <EmptyState
            title="No featured content yet"
            description="Full content population happens in later phases."
          />
        ) : (
          <Grid minItemWidth={240} gap="md">
            {featured.map((article) => (
              <Card key={article.id} to={`/article/${article.id}`}>
                <CardHeader>
                  <h3>{article.title}</h3>
                </CardHeader>
                <CardBody>{article.summary}</CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </section>
    </div>
  )
}
