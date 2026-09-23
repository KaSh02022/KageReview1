import { useSearchParams } from 'react-router-dom'
import { articles, characters } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Grid } from '../components/ui/Layout/Grid'
import { Stack } from '../components/ui/Layout/Stack'
import { Card, CardHeader } from '../components/ui/Card/Card'

/**
 * Phase 1 search is a trivial substring match over seed titles/names only,
 * just to prove the search-bar → results-page wiring. The real client-side
 * search index (FR-011) over the full dataset is built in Phase 6.
 */
export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  const matchedArticles = query
    ? articles.filter((article) => article.title.toLowerCase().includes(query))
    : []
  const matchedCharacters = query
    ? characters.filter((character) => character.name.toLowerCase().includes(query))
    : []
  const hasResults = matchedArticles.length > 0 || matchedCharacters.length > 0

  return (
    <PagePlaceholder
      title="Search"
      description={query ? `Results for "${query}"` : 'Enter a search term using the header search bar.'}
    >
      {query && !hasResults && (
        <EmptyState title="No results" description="Try a different search term." />
      )}
      <Stack gap="xl">
        {matchedArticles.length > 0 && (
          <section aria-labelledby="search-articles">
            <SectionHeader id="search-articles" title="Articles" level={2} />
            <Grid minItemWidth={200} gap="sm">
              {matchedArticles.map((article) => (
                <Card key={article.id} to={`/article/${article.id}`}>
                  <CardHeader>
                    <h3>{article.title}</h3>
                  </CardHeader>
                </Card>
              ))}
            </Grid>
          </section>
        )}
        {matchedCharacters.length > 0 && (
          <section aria-labelledby="search-characters">
            <SectionHeader id="search-characters" title="Characters" level={2} />
            <Grid minItemWidth={160} gap="sm">
              {matchedCharacters.map((character) => (
                <Card key={character.id} to={`/character/${character.id}`}>
                  <CardHeader>
                    <h3>{character.name}</h3>
                  </CardHeader>
                </Card>
              ))}
            </Grid>
          </section>
        )}
      </Stack>
    </PagePlaceholder>
  )
}
