import { useParams } from 'react-router-dom'
import { events, getCategoryById, resolveRelatedContent } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { useDynamicDocumentTitle } from '../hooks/useDynamicDocumentTitle'
import { Badge } from '../components/ui/Badge/Badge'
import { Link } from '../components/ui/Link/Link'
import { Stack } from '../components/ui/Layout/Stack'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import styles from './DetailPage.module.css'

export function EventDetailPage() {
  const { id } = useParams()
  const event = events.find((item) => item.id === id)
  useDynamicDocumentTitle(event?.title)

  if (!event) {
    return <EmptyState title="Event not found" description={`No event with id "${id}".`} />
  }

  const category = getCategoryById(event.categoryId)
  const categoryRoute = CATEGORY_ROUTES.find((route) => route.categoryId === event.categoryId)
  const related = resolveRelatedContent(event.relatedIds)

  return (
    <article className={styles.wrapper}>
      {category && categoryRoute && (
        <Link to={`/${categoryRoute.path}`} tone="muted" underline>
          ← Back to {category.name}
        </Link>
      )}
      <img className={styles.heroImage} src={event.image.src} alt={event.image.alt} loading="lazy" />
      <h1>{event.title}</h1>
      <Stack direction="row" gap="sm" wrap className={styles.meta}>
        {category && <Badge tone="primary">{category.name}</Badge>}
        <Badge tone="neutral">{event.eventType}</Badge>
        <Badge tone="neutral">{event.status}</Badge>
        {event.fictional && <Badge tone="warning">Simulated fan event — not a real-world event</Badge>}
      </Stack>
      <p className={styles.summary}>
        {event.date} · {event.location}
      </p>
      <div className={styles.inlineAction}>
        <BookmarkToggle contentType="event" contentId={event.id} />
      </div>
      <p>{event.description}</p>
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
