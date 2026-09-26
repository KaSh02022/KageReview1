/** Formats a merchandise price range with the currency after the number (e.g. "45–55 USD"), not before. */
export function formatPriceRange(min: number, max: number, currency: string): string {
  return `${min}–${max} ${currency}`
}

/** Formats a single price (e.g. a cart line total) the same way (e.g. "90 USD"). */
export function formatPrice(amount: number, currency: string): string {
  return `${amount} ${currency}`
}
