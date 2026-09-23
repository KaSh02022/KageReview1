import { useParams } from 'react-router-dom'
import { characters, getCategoryById, resolveRelatedContent } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { useDynamicDocumentTitle } from '../hooks/useDynamicDocumentTitle'
import { Badge } from '../components/ui/Badge/Badge'
import { Link } from '../components/ui/Link/Link'
import { Stack } from '../components/ui/Layout/Stack'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import styles from './DetailPage.module.css'

export function CharacterDetailPage() {
  const { id } = useParams()
  const character = characters.find((item) => item.id === id)
  useDynamicDocumentTitle(character?.name)

  if (!character) {
    return <EmptyState title="Character not found" description={`No character with id "${id}".`} />
  }

  const category = getCategoryById(character.categoryId)
  const categoryRoute = CATEGORY_ROUTES.find((route) => route.categoryId === character.categoryId)
  const related = resolveRelatedContent(character.relatedIds)

  return (
    <article className={styles.wrapper}>
      {category && categoryRoute && (
        <Link to={`/${categoryRoute.path}`} tone="muted" underline>
          ← Back to {category.name}
        </Link>
      )}
      <img className={styles.portraitImage} src={character.image.src} alt={character.image.alt} loading="lazy" />
      <h1>{character.name}</h1>
      <Stack direction="row" gap="sm" wrap className={styles.meta}>
        {category && <Badge tone="primary">{category.name}</Badge>}
        <span>
          {character.role} · {character.series}
        </span>
      </Stack>
      <div className={styles.inlineAction}>
        <BookmarkToggle contentType="character" contentId={character.id} />
      </div>
      <p className={styles.summary}>{character.biography}</p>
      <h2>Traits</h2>
      <Stack direction="row" gap="sm" wrap>
        {character.traits.map((trait) => (
          <Badge key={trait} tone="neutral">
            {trait}
          </Badge>
        ))}
      </Stack>
      <section aria-labelledby="related-heading" className={styles.related}>
        <h2 id="related-heading">Related content</h2>
        {related.length === 0 ? (
          <p>No related content linked yet.</p>
        ) : (
          <ul>
            {related.map((item) => (
              <li key={item.id}>
                <Link to={item.path}>{item.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
