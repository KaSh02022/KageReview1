import { media } from '../data'
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
import type { MediaItem } from '../types/content'

const CATEGORY_OPTIONS = CATEGORY_ROUTES.map((route) => ({ value: route.categoryId, label: route.label }))
const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'recent', label: 'Recent' },
  { value: 'archived', label: 'Archived' },
]
const SORT_OPTIONS = [
  { value: 'az' as const, label: 'A–Z' },
  { value: 'za' as const, label: 'Z–A' },
  { value: 'newest' as const, label: 'Newest first' },
  { value: 'oldest' as const, label: 'Oldest first' },
]

const getCategoryId = (item: MediaItem) => item.categoryId
const getStatus = (item: MediaItem) => item.releaseStatus
const getTitle = (item: MediaItem) => item.title
const getDate = (item: MediaItem) => item.publishedDate

export function TrailersPage() {
  const allTrailers = media.filter((item) => item.mediaType === 'trailer')
  const filterState = useListFilterState('az')
  const { categoryIds, statuses, sort } = filterState

  const byCategory = applyFilters(allTrailers, { categoryIds: [], statuses }, getCategoryId, getStatus)
  const byStatus = applyFilters(allTrailers, { categoryIds, statuses: [] }, getCategoryId, getStatus)
  const filtered = applyFilters(allTrailers, { categoryIds, statuses }, getCategoryId, getStatus)
  const trailers = applySort(filtered, sort, { getTitle, getDate })

  const facets = [
    deriveCategoryFacet(byCategory, getCategoryId, CATEGORY_OPTIONS, categoryIds),
    deriveStatusFacet(byStatus, getStatus, STATUS_OPTIONS, statuses),
  ]

  return (
    <PagePlaceholder
      title="Trailers"
      description="Every trailer across all seven fandom hubs. Each one is a demonstrative listing for an original, fictional franchise — there is no video to play."
      wide
      hero={
        <ExploreCinematicHero
          surface="trailers"
          title="Trailers"
          eyebrow="Every world, in motion"
          description="Every trailer across all seven fandom hubs. Each one is a demonstrative listing for an original, fictional franchise — there is no video to play."
          accent="255, 182, 72"
        />
      }
    >
      <ListFilterControls
        resultCount={trailers.length}
        resultNoun="trailer"
        facets={facets}
        selected={{ category: categoryIds, status: statuses }}
        onToggle={(key, value) =>
          key === 'category' ? filterState.toggleCategory(value as MediaItem['categoryId']) : filterState.toggleStatus(value)
        }
        onClearFacet={(key) => (key === 'category' ? filterState.clearCategory() : filterState.clearStatus())}
        onClearAll={filterState.clearAll}
        activeCount={filterState.activeCount}
        sort={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={filterState.setSort}
      />

      {trailers.length === 0 ? (
        <EmptyState title="No trailers match" description="Try clearing a filter." />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {trailers.map((trailer) => (
            <Card key={trailer.id}>
              <CardMedia>
                <img src={trailer.thumbnail.src} alt={trailer.thumbnail.alt} loading="lazy" />
              </CardMedia>
              <CardHeader>
                <h2>{trailer.title}</h2>
              </CardHeader>
              <CardMeta>
                <Badge tone="neutral">{trailer.categoryId}</Badge>
                <Badge tone={trailer.releaseStatus === 'upcoming' ? 'primary' : 'neutral'}>
                  {trailer.releaseStatus}
                </Badge>
              </CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
