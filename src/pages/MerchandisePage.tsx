import { merchandise } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardMedia, CardHeader, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'
import { Grid } from '../components/ui/Layout/Grid'

export function MerchandisePage() {
  return (
    <PagePlaceholder
      title="Merchandise"
      description="Fan merchandise showcase across all seven fandom hubs, with a temporary demo shopping cart — no checkout, payment, or real purchase (FR-027–031)."
    >
      <Grid minItemWidth={220} gap="md">
        {merchandise.map((product) => (
          <Card key={product.id} to={`/product/${product.id}`}>
            <CardMedia>
              <img src={product.image.src} alt={product.image.alt} loading="lazy" />
            </CardMedia>
            <CardHeader>
              <h3>{product.name}</h3>
            </CardHeader>
            <CardBody>
              {product.currency} {product.priceRangeMin}–{product.priceRangeMax}
            </CardBody>
            <CardFooter>
              <Badge tone={product.status === 'available' ? 'success' : 'neutral'}>{product.status}</Badge>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </PagePlaceholder>
  )
}
