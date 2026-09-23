import { useCartStore, selectCartTotal } from '../stores/cartStore'
import { merchandise } from '../data'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'

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
      requirementIds={['FR-029', 'FR-030', 'FR-031']}
    >
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" description="Add items from the Merchandise page." />
      ) : (
        <>
          <ul>
            {items.map((item) => {
              const product = merchandise.find((entry) => entry.id === item.merchandiseId)
              if (!product) return null
              return (
                <li key={item.merchandiseId}>
                  {product.name} × {item.quantity} — {product.currency}{' '}
                  {product.priceRangeMin * item.quantity}
                  <button
                    type="button"
                    onClick={() => setQuantity(item.merchandiseId, item.quantity + 1)}
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.merchandiseId, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    −
                  </button>
                  <button type="button" onClick={() => removeItem(item.merchandiseId)}>
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
          <p>
            <strong>Total: {total}</strong> (temporary, demo cart only)
          </p>
        </>
      )}
    </PagePlaceholder>
  )
}
