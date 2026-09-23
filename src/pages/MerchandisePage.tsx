import { merchandise } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardHeader, CardBody } from '../components/ui/Card/Card'
import { Grid } from '../components/ui/Layout/Grid'

export function MerchandisePage() {
  return (
    <PagePlaceholder
      title="Merchandise"
      description="Fan merchandise showcase with a temporary shopping cart. Phase 1 lists only seed products; the full catalog is Phase 9."
      requirementIds={['FR-027', 'FR-028', 'FR-029', 'FR-030', 'FR-031']}
      phase="Phase 9"
    >
      <Grid minItemWidth={220} gap="md">
        {merchandise.map((product) => (
          <Card key={product.id} to={`/product/${product.id}`}>
            <CardHeader>
              <h3>{product.name}</h3>
            </CardHeader>
            <CardBody>
              {product.currency} {product.priceRangeMin}–{product.priceRangeMax}
            </CardBody>
          </Card>
        ))}
      </Grid>
    </PagePlaceholder>
  )
}
