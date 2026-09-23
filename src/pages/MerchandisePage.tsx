import { Link } from 'react-router-dom'
import { merchandise } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'

export function MerchandisePage() {
  return (
    <PagePlaceholder
      title="Merchandise"
      description="Fan merchandise showcase with a temporary shopping cart. Phase 1 lists only seed products; the full catalog is Phase 9."
      requirementIds={['FR-027', 'FR-028', 'FR-029', 'FR-030', 'FR-031']}
      phase="Phase 9"
    >
      <ul>
        {merchandise.map((product) => (
          <li key={product.id}>
            <Link to={`/product/${product.id}`}>{product.name}</Link> — {product.currency}{' '}
            {product.priceRangeMin}–{product.priceRangeMax}
          </li>
        ))}
      </ul>
    </PagePlaceholder>
  )
}
