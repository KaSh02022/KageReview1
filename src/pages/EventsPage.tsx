import { Link } from 'react-router-dom'
import { events } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function EventsPage() {
  return (
    <PagePlaceholder
      title="Events"
      description="Cross-category event highlights. Phase 1 shows only seed entries; full population is Phase 7."
      requirementIds={['FR-022', 'FR-023', 'FR-024']}
      phase="Phase 7"
    >
      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <Link to={`/event/${event.id}`}>{event.title}</Link> — {event.date} ({event.status})
            </li>
          ))}
        </ul>
      )}
    </PagePlaceholder>
  )
}
