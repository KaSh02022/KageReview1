import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, selectCartTotal } from './cartStore'
import { STORAGE_KEYS } from '../utils/storage'

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useCartStore.setState({ items: [] })
  })

  it('initializes with an empty cart', () => {
    expect(useCartStore.getState().items).toEqual([])
    expect(selectCartTotal(useCartStore.getState())).toBe(0)
  })

  it('adds and accumulates quantity for the same item', () => {
    useCartStore.getState().addItem('merch-anime-sample-01')
    useCartStore.getState().addItem('merch-anime-sample-01', 2)
    expect(useCartStore.getState().items).toEqual([
      { merchandiseId: 'merch-anime-sample-01', quantity: 3 },
    ])
  })

  it('removes an item', () => {
    useCartStore.getState().addItem('merch-anime-sample-01')
    useCartStore.getState().removeItem('merch-anime-sample-01')
    expect(useCartStore.getState().items).toEqual([])
  })

  it('persists cart contents to localStorage under the cart storage key (D-005)', () => {
    useCartStore.getState().addItem('merch-anime-sample-01', 2)

    const raw = localStorage.getItem(STORAGE_KEYS.cart)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.items).toEqual([{ merchandiseId: 'merch-anime-sample-01', quantity: 2 }])
  })

  it('never writes cart state to sessionStorage', () => {
    useCartStore.getState().addItem('merch-anime-sample-01')
    expect(sessionStorage.getItem(STORAGE_KEYS.cart)).toBeNull()
  })
})
