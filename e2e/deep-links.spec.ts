import { test, expect } from '@playwright/test'

/**
 * Phase 3 §10: because FandomVerse uses HashRouter, the hash fragment
 * never reaches the server — a static host only ever needs to serve
 * `index.html` for `/`, and every route after the `#` is resolved
 * entirely client-side. This verifies that holds for every representative
 * deep route: direct navigation (as if from a bookmark/shared link) and a
 * hard page refresh at that route both work, with no broken state.
 */
const DEEP_LINKS: Array<[string, RegExp]> = [
  ['/', /FandomVerse/i],
  ['/anime', /^Anime$/i],
  ['/gaming', /^Gaming$/i],
  ['/article/article-anime-sample-01', /sample article/i],
  ['/character/character-anime-sample-01', /sample character one/i],
  ['/event/event-anime-sample-01', /sample event/i],
  ['/product/merch-anime-sample-01', /sample t-shirt/i],
  ['/search', /^Search$/i],
  ['/trailers', /^Trailers$/i],
  ['/events', /^Events$/i],
  ['/releases', /upcoming releases/i],
  ['/merchandise', /^Merchandise$/i],
  ['/cart', /your cart/i],
  ['/bookmarks', /^Bookmarks$/i],
  ['/contact', /contact us/i],
  ['/about', /about fandomverse/i],
]

for (const [path, expectedHeading] of DEEP_LINKS) {
  test(`direct navigation to #${path} loads correctly`, async ({ page }) => {
    await page.goto(`/#${path}`)
    await expect(page.getByRole('heading', { level: 1, name: expectedHeading })).toBeVisible()
  })

  test(`refreshing at #${path} does not break the app`, async ({ page }) => {
    await page.goto(`/#${path}`)
    await expect(page.getByRole('heading', { level: 1, name: expectedHeading })).toBeVisible()

    await page.reload()

    await expect(page.getByRole('heading', { level: 1, name: expectedHeading })).toBeVisible()
    // A broken reload would show React Router's errorElement or a blank
    // shell — confirm the real app chrome (header nav) survived too.
    await expect(page.getByRole('banner').getByRole('link', { name: 'FandomVerse' })).toBeVisible()
  })
}

test('deep link with a query string (search) preserves the query on load', async ({ page }) => {
  await page.goto('/#/search?q=anime')
  await expect(page.getByText('Results for "anime"')).toBeVisible()
})

test('an unknown deep link still resolves to the Not Found page, not a server 404', async ({ page }) => {
  await page.goto('/#/this-route-does-not-exist-anywhere')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})
