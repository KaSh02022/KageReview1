import { merchandise } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { ExploreCinematicHero } from '../features/explore/ExploreCinematicHero'
import { Card, CardMedia, CardHeader, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'
import { Grid } from '../components/ui/Layout/Grid'
import { formatPriceRange } from '../utils/formatPrice'

export function MerchandisePage() {
  return (
    <PagePlaceholder
      title="Merchandise"
      description="Fan merchandise across all seven fandom hubs, with a temporary demo cart. These products are fictional and cannot be bought — there is no checkout, no payment, and no real purchase."
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
      <Grid minItemWidth={220} gap="md">
        {merchandise.map((product) => (
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
    </PagePlaceholder>
  )
}
