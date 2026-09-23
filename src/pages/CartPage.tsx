import { useCartStore, selectCartTotal } from '../stores/cartStore'
import { merchandise } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Stack } from '../components/ui/Layout/Stack'
import { IconButton } from '../components/ui/Button/IconButton'
import { Button } from '../components/ui/Button/Button'
import styles from './CartPage.module.css'

/** Temporary cart, D-005: localStorage-persisted, no checkout/payment (FR-031). */
export function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const total = useCartStore(selectCartTotal)

  return (
    <PagePlaceholder
      title="Your cart"
      description="This cart is temporary and browser-local (saved via localStorage on this device only). There is no checkout, payment, or real purchase."
    >
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" description="Add items from the Merchandise page." />
      ) : (
        <Stack gap="md">
          {items.map((item) => {
            const product = merchandise.find((entry) => entry.id === item.merchandiseId)
            if (!product) return null
            return (
              <Card key={item.merchandiseId}>
                <CardBody className={styles.lineItem}>
                  <span>
                    {product.name} — {product.currency} {product.priceRangeMin * item.quantity}
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
            <strong>Total: {total}</strong> — temporary, demo cart only
          </p>
        </Stack>
      )}
    </PagePlaceholder>
  )
}
