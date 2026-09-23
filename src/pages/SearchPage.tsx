import { Link, useSearchParams } from 'react-router-dom'
import { articles, characters } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'

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
      requirementIds={['FR-009', 'FR-010', 'FR-011']}
      phase="Phase 6 (full client-side search index)"
    >
      {query && !hasResults && (
        <EmptyState title="No results" description="Try a different search term." />
      )}
      {matchedArticles.length > 0 && (
        <section>
          <h2>Articles</h2>
          <ul>
            {matchedArticles.map((article) => (
              <li key={article.id}>
                <Link to={`/article/${article.id}`}>{article.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {matchedCharacters.length > 0 && (
        <section>
          <h2>Characters</h2>
          <ul>
            {matchedCharacters.map((character) => (
              <li key={character.id}>
                <Link to={`/character/${character.id}`}>{character.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PagePlaceholder>
  )
}
