import { useCartStore, selectCartTotal } from '../stores/cartStore'
import { merchandise } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Stack } from '../components/ui/Layout/Stack'
import { IconButton } from '../components/ui/Button/IconButton'
import { Button } from '../components/ui/Button/Button'
import { formatPrice } from '../utils/formatPrice'
import styles from './CartPage.module.css'

/**
 * Cart, D-005/FR-031: saved to this device only, no checkout/payment.
 * Copy carries none of that implementation detail (2026-09-26, UI/Copy
 * Cleanup) — behaviour (persistence, no real purchase) is unchanged; see
 * e2e/content-honesty.spec.ts for the still-enforced honesty guarantees.
 */
export function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const total = useCartStore(selectCartTotal)

  return (
    <PagePlaceholder
      title="Your Cart"
      description="Items you've added from the Merchandise collection, ready whenever you want to check back."
    >
      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Explore the Merchandise collection and add your favorite items to your cart."
        />
      ) : (
        <Stack gap="md">
          {items.map((item) => {
            const product = merchandise.find((entry) => entry.id === item.merchandiseId)
            if (!product) return null
            return (
              <Card key={item.merchandiseId}>
                <CardBody className={styles.lineItem}>
                  <span>
                    {product.name} — {formatPrice(product.priceRangeMin * item.quantity, product.currency)}
                  </span>
                  <Stack direction="row" gap="xs" align="center">
                    <IconButton
                      label={`Decrease quantity of ${product.name}`}
                      icon="−"
                      size="small"
                      variant="outline"
                      onClick={() => setQuantity(item.merchandiseId, item.quantity - 1)}
                    />
                    <span aria-hidden="true">{item.quantity}</span>
                    <IconButton
                      label={`Increase quantity of ${product.name}`}
                      icon="+"
                      size="small"
                      variant="outline"
                      onClick={() => setQuantity(item.merchandiseId, item.quantity + 1)}
                    />
                  </Stack>
                </CardBody>
                <CardFooter>
                  <Button variant="ghost" size="small" onClick={() => removeItem(item.merchandiseId)}>
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
          <p className={styles.total}>
            {/* Every merchandise item in this catalogue uses USD (src/data/merchandise.json) — there is no multi-currency case to derive this from per-line. */}
            <strong>Total: {formatPrice(total, 'USD')}</strong>
          </p>
        </Stack>
      )}
    </PagePlaceholder>
  )
}
