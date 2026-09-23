import { useParams } from 'react-router-dom'
import { merchandise } from '../data'
import { useCartStore } from '../stores/cartStore'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Button } from '../components/ui/Button/Button'

export function ProductDetailPage() {
  const { id } = useParams()
  const product = merchandise.find((item) => item.id === id)
  const addItem = useCartStore((state) => state.addItem)

  if (!product) {
    return <EmptyState title="Product not found" description={`No product with id "${id}".`} />
  }

  return (
    <article>
      <h1>{product.name}</h1>
      <p>
        {product.currency} {product.priceRangeMin}–{product.priceRangeMax}
      </p>
      <p>{product.description}</p>
      <Button variant="primary" onClick={() => addItem(product.id)}>
        Add to cart
      </Button>
      <p>
        <em>Temporary demo cart only — no checkout, payment, or real purchase (FR-031).</em>
      </p>
    </article>
  )
}
