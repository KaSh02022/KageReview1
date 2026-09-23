import { events } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

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
        <Grid minItemWidth={220} gap="md">
          {events.map((event) => (
            <Card key={event.id} to={`/event/${event.id}`}>
              <CardHeader>
                <h3>{event.title}</h3>
              </CardHeader>
              <CardMeta>
                <span>{event.date}</span>
                <Badge tone={event.status === 'upcoming' ? 'primary' : 'neutral'}>{event.status}</Badge>
              </CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
