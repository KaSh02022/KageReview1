import { useParams } from 'react-router-dom'
import { merchandise, getCategoryById } from '../data'
import { useCartStore } from '../stores/cartStore'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { useDynamicDocumentTitle } from '../hooks/useDynamicDocumentTitle'
import { Button } from '../components/ui/Button/Button'
import { Badge } from '../components/ui/Badge/Badge'
import { Link } from '../components/ui/Link/Link'
import { Stack } from '../components/ui/Layout/Stack'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import styles from './DetailPage.module.css'

export function ProductDetailPage() {
  const { id } = useParams()
  const product = merchandise.find((item) => item.id === id)
  const addItem = useCartStore((state) => state.addItem)
  useDynamicDocumentTitle(product?.name)

  if (!product) {
    return <EmptyState title="Product not found" description={`No product with id "${id}".`} />
  }

  const category = getCategoryById(product.categoryId)
  const categoryRoute = CATEGORY_ROUTES.find((route) => route.categoryId === product.categoryId)
  const isAvailable = product.status === 'available'

  return (
    <article className={styles.wrapper}>
      {category && categoryRoute && (
        <Link to={`/${categoryRoute.path}`} tone="muted" underline>
          ← Back to {category.name}
        </Link>
      )}
      <img className={styles.heroImage} src={product.image.src} alt={product.image.alt} loading="lazy" />
      <h1>{product.name}</h1>
      <Stack direction="row" gap="sm" wrap className={styles.meta}>
        {category && <Badge tone="primary">{category.name}</Badge>}
        <Badge tone={isAvailable ? 'success' : 'neutral'}>{product.status}</Badge>
      </Stack>
      <p className={styles.summary}>
        {product.currency} {product.priceRangeMin}–{product.priceRangeMax}
      </p>
      <p>{product.description}</p>
      <div className={styles.inlineAction}>
        <Button variant="primary" onClick={() => addItem(product.id)} disabled={!isAvailable}>
          {isAvailable ? 'Add to cart' : 'Coming soon'}
        </Button>
      </div>
      <p>
        <em>This is a fictional product in a temporary demo cart — no checkout, payment, or real purchase.</em>
      </p>
    </article>
  )
}
