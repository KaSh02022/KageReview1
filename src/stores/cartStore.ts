import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartLineItem } from '../types/content'
import { STORAGE_KEYS } from '../utils/storage'
import { merchandise } from '../data'

interface CartState {
  items: CartLineItem[]
  addItem: (merchandiseId: string, quantity?: number) => void
  removeItem: (merchandiseId: string) => void
  setQuantity: (merchandiseId: string, quantity: number) => void
  clear: () => void
}

/**
 * Temporary, browser-local cart — persisted to localStorage per D-005
 * (docs/11_DECISION_LOG.md). This is NOT an account/order cart: no
 * checkout, no payment, no server persistence (SRS constraint, FR-031).
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (merchandiseId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.merchandiseId === merchandiseId)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.merchandiseId === merchandiseId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            }
          }
          return { items: [...state.items, { merchandiseId, quantity }] }
        }),
      removeItem: (merchandiseId) =>
        set((state) => ({
          items: state.items.filter((item) => item.merchandiseId !== merchandiseId),
        })),
      setQuantity: (merchandiseId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.merchandiseId !== merchandiseId)
              : state.items.map((item) =>
                  item.merchandiseId === merchandiseId ? { ...item, quantity } : item,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEYS.cart,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

/** Derived selector: cart total in the merchandise dataset's currency (assumes a single currency for Phase 1 seed data). */
export function selectCartTotal(state: CartState): number {
  return state.items.reduce((total, item) => {
    const product = merchandise.find((entry) => entry.id === item.merchandiseId)
    if (!product) return total
    return total + product.priceRangeMin * item.quantity
  }, 0)
}
