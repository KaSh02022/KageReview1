import { useParams } from 'react-router-dom'
import { articles, characters, events, media, galleries, getCategoryById } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Grid } from '../components/ui/Layout/Grid'
import { Stack } from '../components/ui/Layout/Stack'
import { Card, CardHeader } from '../components/ui/Card/Card'

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
  const accent = category ? `var(--color-accent-${category.id.replace('-', '')})` : undefined

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
        <Stack gap="xl">
          {categoryArticles.length > 0 && (
            <section aria-labelledby={`${categoryId}-articles`}>
              <SectionHeader id={`${categoryId}-articles`} title="Articles" level={3} />
              <Grid minItemWidth={200} gap="sm">
                {categoryArticles.map((article) => (
                  <Card key={article.id} to={`/article/${article.id}`} accent={accent}>
                    <CardHeader>
                      <h4>{article.title}</h4>
                    </CardHeader>
                  </Card>
                ))}
              </Grid>
            </section>
          )}
          {categoryCharacters.length > 0 && (
            <section aria-labelledby={`${categoryId}-characters`}>
              <SectionHeader id={`${categoryId}-characters`} title="Characters" level={3} />
              <Grid minItemWidth={160} gap="sm">
                {categoryCharacters.map((character) => (
                  <Card key={character.id} to={`/character/${character.id}`} accent={accent}>
                    <CardHeader>
                      <h4>{character.name}</h4>
                    </CardHeader>
                  </Card>
                ))}
              </Grid>
            </section>
          )}
          {categoryEvents.length > 0 && (
            <section aria-labelledby={`${categoryId}-events`}>
              <SectionHeader id={`${categoryId}-events`} title="Events" level={3} />
              <Grid minItemWidth={200} gap="sm">
                {categoryEvents.map((event) => (
                  <Card key={event.id} to={`/event/${event.id}`} accent={accent}>
                    <CardHeader>
                      <h4>{event.title}</h4>
                    </CardHeader>
                  </Card>
                ))}
              </Grid>
            </section>
          )}
          {categoryMedia.length > 0 && (
            <section aria-labelledby={`${categoryId}-media`}>
              <SectionHeader id={`${categoryId}-media`} title="Videos & Audio" level={3} />
              <Grid minItemWidth={200} gap="sm">
                {categoryMedia.map((item) => (
                  <Card key={item.id} accent={accent}>
                    <CardHeader>
                      <h4>{item.title}</h4>
                    </CardHeader>
                  </Card>
                ))}
              </Grid>
            </section>
          )}
          {categoryGalleries.length > 0 && (
            <section aria-labelledby={`${categoryId}-gallery`}>
              <SectionHeader id={`${categoryId}-gallery`} title="Gallery" level={3} />
              <Grid minItemWidth={200} gap="sm">
                {categoryGalleries.map((gallery) => (
                  <Card key={gallery.id} accent={accent}>
                    <CardHeader>
                      <h4>{gallery.title}</h4>
                    </CardHeader>
                  </Card>
                ))}
              </Grid>
            </section>
          )}
        </Stack>
      )}
    </PagePlaceholder>
  )
}
