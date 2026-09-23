import { events } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardMedia, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

export function EventsPage() {
  return (
    <PagePlaceholder
      title="Events"
      description="Cross-category event highlights across all seven fandom hubs — 21 simulated fan events (3 per category). Filtering/sorting is a later phase (FR-022–024)."
    >
      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {events.map((event) => (
            <Card key={event.id} to={`/event/${event.id}`}>
              <CardMedia>
                <img src={event.image.src} alt={event.image.alt} loading="lazy" />
              </CardMedia>
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
