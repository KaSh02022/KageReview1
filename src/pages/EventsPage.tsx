import { events } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { ExploreCinematicHero } from '../features/explore/ExploreCinematicHero'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardMedia, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

export function EventsPage() {
  return (
    <PagePlaceholder
      title="Events"
      description="Event highlights across all seven fandom hubs — 21 simulated fan events (3 per category). Every event is fictional and none of them takes place. Filtering and sorting are coming later."
      wide
      hero={
        <ExploreCinematicHero
          surface="events"
          title="Events"
          eyebrow="Where the fandoms gather"
          description="Event highlights across all seven fandom hubs — 21 simulated fan events (3 per category). Every event is fictional and none of them takes place. Filtering and sorting are coming later."
          accent="143, 123, 255"
        />
      }
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
                <h2>{event.title}</h2>
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
