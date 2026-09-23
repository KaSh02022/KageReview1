import { useParams } from 'react-router-dom'
import { events } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function EventDetailPage() {
  const { id } = useParams()
  const event = events.find((item) => item.id === id)

  if (!event) {
    return <EmptyState title="Event not found" description={`No event with id "${id}".`} />
  }

  return (
    <article>
      <h1>{event.title}</h1>
      <p>
        {event.date} · {event.location} · {event.status}
      </p>
      <BookmarkToggle contentType="event" contentId={event.id} />
      <p>{event.description}</p>
    </article>
  )
}
