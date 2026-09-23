import { useParams } from 'react-router-dom'
import { articles } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function ArticleDetailPage() {
  const { id } = useParams()
  const article = articles.find((item) => item.id === id)

  if (!article) {
    return <EmptyState title="Article not found" description={`No article with id "${id}".`} />
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.summary}</p>
      <BookmarkToggle contentType="article" contentId={article.id} />
      <p>{article.body}</p>
      <section aria-labelledby="related-heading">
        <h2 id="related-heading">Related content</h2>
        {article.relatedIds.length === 0 ? (
          <p>No related content linked yet.</p>
        ) : (
          <ul>
            {article.relatedIds.map((relatedId) => (
              <li key={relatedId}>{relatedId}</li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
