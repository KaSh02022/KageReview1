import { events } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { ExploreCinematicHero } from '../features/explore/ExploreCinematicHero'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardMedia, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { applyFilters } from '../features/filter/applyFilters'
import { applySort } from '../features/filter/applySort'
import { deriveCategoryFacet, deriveStatusFacet } from '../features/filter/deriveFacets'
import { useListFilterState } from '../features/filter/useListFilterState'
import { ListFilterControls } from '../components/filter/ListFilterControls'
import type { EventItem } from '../types/content'

const CATEGORY_OPTIONS = CATEGORY_ROUTES.map((route) => ({ value: route.categoryId, label: route.label }))
const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]
const SORT_OPTIONS = [
  { value: 'az' as const, label: 'A–Z' },
  { value: 'za' as const, label: 'Z–A' },
  { value: 'newest' as const, label: 'Newest first' },
  { value: 'oldest' as const, label: 'Oldest first' },
]

const getCategoryId = (item: EventItem) => item.categoryId
const getStatus = (item: EventItem) => item.status
const getTitle = (item: EventItem) => item.title
const getDate = (item: EventItem) => item.date

export function EventsPage() {
  const filterState = useListFilterState('az')
  const { categoryIds, statuses, sort } = filterState

  const byCategory = applyFilters(events, { categoryIds: [], statuses }, getCategoryId, getStatus)
  const byStatus = applyFilters(events, { categoryIds, statuses: [] }, getCategoryId, getStatus)
  const filtered = applyFilters(events, { categoryIds, statuses }, getCategoryId, getStatus)
  const sortedEvents = applySort(filtered, sort, { getTitle, getDate })

  const facets = [
    deriveCategoryFacet(byCategory, getCategoryId, CATEGORY_OPTIONS, categoryIds),
    deriveStatusFacet(byStatus, getStatus, STATUS_OPTIONS, statuses),
  ]

  return (
    <PagePlaceholder
      title="Events"
      description="Event highlights across all seven fandom hubs — 21 simulated fan events (3 per category). Every event is fictional and none of them takes place."
      wide
      hero={
        <ExploreCinematicHero
          surface="events"
          title="Events"
          eyebrow="Where the fandoms gather"
          description="Event highlights across all seven fandom hubs — 21 simulated fan events (3 per category). Every event is fictional and none of them takes place."
          accent="143, 123, 255"
        />
      }
    >
      <ListFilterControls
        resultCount={sortedEvents.length}
        resultNoun="event"
        facets={facets}
        selected={{ category: categoryIds, status: statuses }}
        onToggle={(key, value) =>
          key === 'category' ? filterState.toggleCategory(value as EventItem['categoryId']) : filterState.toggleStatus(value)
        }
        onClearFacet={(key) => (key === 'category' ? filterState.clearCategory() : filterState.clearStatus())}
        onClearAll={filterState.clearAll}
        activeCount={filterState.activeCount}
        sort={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={filterState.setSort}
      />

      {sortedEvents.length === 0 ? (
        <EmptyState title="No events match" description="Try clearing a filter." />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {sortedEvents.map((event) => (
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
