import { useParams } from 'react-router-dom'
import { articles, getCategoryById, resolveRelatedContent } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { useDynamicDocumentTitle } from '../hooks/useDynamicDocumentTitle'
import { Badge } from '../components/ui/Badge/Badge'
import { Link } from '../components/ui/Link/Link'
import { Stack } from '../components/ui/Layout/Stack'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import styles from './DetailPage.module.css'

export function ArticleDetailPage() {
  const { id } = useParams()
  const article = articles.find((item) => item.id === id)
  useDynamicDocumentTitle(article?.title)

  if (!article) {
    return <EmptyState title="Article not found" description={`No article with id "${id}".`} />
  }

  const category = getCategoryById(article.categoryId)
  const categoryRoute = CATEGORY_ROUTES.find((route) => route.categoryId === article.categoryId)
  const related = resolveRelatedContent(article.relatedIds)

  return (
    <article className={styles.wrapper}>
      {category && categoryRoute && (
        <Link to={`/${categoryRoute.path}`} tone="muted" underline>
          ← Back to {category.name}
        </Link>
      )}
      <img className={styles.heroImage} src={article.thumbnail.src} alt={article.thumbnail.alt} loading="lazy" />
      <h1>{article.title}</h1>
      <Stack direction="row" gap="sm" wrap className={styles.meta}>
        {category && <Badge tone="primary">{category.name}</Badge>}
        <span>{article.publishedDate}</span>
        {article.tags.map((tag) => (
          <Badge key={tag} tone="neutral">
            {tag}
          </Badge>
        ))}
      </Stack>
      <div className={styles.inlineAction}>
        <BookmarkToggle contentType="article" contentId={article.id} />
      </div>
      <p className={styles.summary}>{article.summary}</p>
      <p>{article.body}</p>
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
