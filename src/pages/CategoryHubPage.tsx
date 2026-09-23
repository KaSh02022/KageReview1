import { Link, useParams } from 'react-router-dom'
import { articles, characters, events, media, galleries, getCategoryById } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import styles from './CategoryHubPage.module.css'

interface CategoryHubPageProps {
  categoryId?: string
  label?: string
}

/**
 * Shared Category Hub, mounted once per category route (docs/02_PRODUCT_ARCHITECTURE.md §3).
 * Phase 1 shows only the seed content available for that category; full
 * catalog/filter/sort (FR-005–008) is Phase 5/6 scope.
 */
export function CategoryHubPage({ categoryId: categoryIdProp, label }: CategoryHubPageProps) {
  const { slug } = useParams()
  const categoryId = categoryIdProp ?? slug ?? ''
  const category = getCategoryById(categoryId)

  const categoryArticles = articles.filter((item) => item.categoryId === categoryId)
  const categoryCharacters = characters.filter((item) => item.categoryId === categoryId)
  const categoryEvents = events.filter((item) => item.categoryId === categoryId)
  const categoryMedia = media.filter((item) => item.categoryId === categoryId)
  const categoryGalleries = galleries.filter((item) => item.categoryId === categoryId)

  const hasAnyContent =
    categoryArticles.length ||
    categoryCharacters.length ||
    categoryEvents.length ||
    categoryMedia.length ||
    categoryGalleries.length

  return (
    <PagePlaceholder
      title={category?.name ?? label ?? 'Category Hub'}
      description={
        category?.description ??
        'Unrecognized category slug — full validation/redirect handling is added alongside real content in Phase 5.'
      }
      requirementIds={['FR-005', 'FR-006', 'FR-007', 'FR-008']}
      phase="Phase 5 (full catalog, filter, sort)"
    >
      {!hasAnyContent ? (
        <EmptyState
          title="No seed content for this category yet"
          description="Phase 1 only ships a few sample entries for architecture verification. Full population happens in Phase 5–8."
        />
      ) : (
        <div className={styles.sections}>
          {categoryArticles.length > 0 && (
            <section>
              <h2>Articles</h2>
              <ul>
                {categoryArticles.map((article) => (
                  <li key={article.id}>
                    <Link to={`/article/${article.id}`}>{article.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {categoryCharacters.length > 0 && (
            <section>
              <h2>Characters</h2>
              <ul>
                {categoryCharacters.map((character) => (
                  <li key={character.id}>
                    <Link to={`/character/${character.id}`}>{character.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {categoryEvents.length > 0 && (
            <section>
              <h2>Events</h2>
              <ul>
                {categoryEvents.map((event) => (
                  <li key={event.id}>
                    <Link to={`/event/${event.id}`}>{event.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {categoryMedia.length > 0 && (
            <section>
              <h2>Videos &amp; Audio</h2>
              <ul>
                {categoryMedia.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            </section>
          )}
          {categoryGalleries.length > 0 && (
            <section>
              <h2>Gallery</h2>
              <ul>
                {categoryGalleries.map((gallery) => (
                  <li key={gallery.id}>{gallery.title}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </PagePlaceholder>
  )
}
