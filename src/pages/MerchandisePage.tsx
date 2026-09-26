import { merchandise } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { ExploreCinematicHero } from '../features/explore/ExploreCinematicHero'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Card, CardMedia, CardHeader, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'
import { Grid } from '../components/ui/Layout/Grid'
import { formatPriceRange } from '../utils/formatPrice'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { applyFilters } from '../features/filter/applyFilters'
import { applySort } from '../features/filter/applySort'
import { deriveCategoryFacet, deriveStatusFacet } from '../features/filter/deriveFacets'
import { useListFilterState } from '../features/filter/useListFilterState'
import { ListFilterControls } from '../components/filter/ListFilterControls'
import type { MerchandiseItem } from '../types/content'

const CATEGORY_OPTIONS = CATEGORY_ROUTES.map((route) => ({ value: route.categoryId, label: route.label }))
const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'coming-soon', label: 'Coming soon' },
  { value: 'sold-out', label: 'Sold out' },
]
const SORT_OPTIONS = [
  { value: 'az' as const, label: 'A–Z' },
  { value: 'za' as const, label: 'Z–A' },
]

const getCategoryId = (item: MerchandiseItem) => item.categoryId
const getStatus = (item: MerchandiseItem) => item.status
const getTitle = (item: MerchandiseItem) => item.name

export function MerchandisePage() {
  const filterState = useListFilterState('az')
  const { categoryIds, statuses, sort } = filterState

  const byCategory = applyFilters(merchandise, { categoryIds: [], statuses }, getCategoryId, getStatus)
  const byStatus = applyFilters(merchandise, { categoryIds, statuses: [] }, getCategoryId, getStatus)
  const filtered = applyFilters(merchandise, { categoryIds, statuses }, getCategoryId, getStatus)
  const sorted = applySort(filtered, sort, { getTitle })

  const facets = [
    deriveCategoryFacet(byCategory, getCategoryId, CATEGORY_OPTIONS, categoryIds),
    deriveStatusFacet(byStatus, getStatus, STATUS_OPTIONS, statuses),
  ]

  return (
    <PagePlaceholder
      title="Merchandise"
      description="Fan merchandise across all seven fandom hubs, with a temporary demo cart. These products are fictional and cannot be bought — there is no checkout, no payment, and no real purchase."
      wide
      hero={
        <ExploreCinematicHero
          surface="merchandise"
          title="Merchandise"
          eyebrow="Take a world home"
          description="Fan merchandise across all seven fandom hubs, with a temporary demo cart. These products are fictional and cannot be bought — there is no checkout, no payment, and no real purchase."
          accent="92, 230, 166"
        />
      }
    >
      <ListFilterControls
        resultCount={sorted.length}
        resultNoun="product"
        facets={facets}
        selected={{ category: categoryIds, status: statuses }}
        onToggle={(key, value) =>
          key === 'category' ? filterState.toggleCategory(value as MerchandiseItem['categoryId']) : filterState.toggleStatus(value)
        }
        onClearFacet={(key) => (key === 'category' ? filterState.clearCategory() : filterState.clearStatus())}
        onClearAll={filterState.clearAll}
        activeCount={filterState.activeCount}
        sort={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={filterState.setSort}
      />

      {sorted.length === 0 ? (
        <EmptyState title="No products match" description="Try clearing a filter." />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {sorted.map((product) => (
            <Card key={product.id} to={`/product/${product.id}`}>
              <CardMedia>
                <img src={product.image.src} alt={product.image.alt} loading="lazy" />
              </CardMedia>
              <CardHeader>
                <h2>{product.name}</h2>
              </CardHeader>
              <CardBody>
                {formatPriceRange(product.priceRangeMin, product.priceRangeMax, product.currency)}
              </CardBody>
              <CardFooter>
                {product.tags.includes('featured') && <Badge tone="primary">Featured</Badge>}
                <Badge tone={product.status === 'available' ? 'success' : 'neutral'}>{product.status}</Badge>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
