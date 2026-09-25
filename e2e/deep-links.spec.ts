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
  // The root is the cinematic landing; this is the heading it owns.
  ['/', /share a sky/i],
  ['/anime', /^Anime$/i],
  ['/gaming', /^Gaming$/i],
  // Real content ids are used deliberately here: the point of this suite is
  // that a bookmarked/shared deep link resolves, so it should break loudly
  // if a published content id ever disappears.
  ['/article/article-anime-why-the-ashen-reaches-feel-alive', /^Starlit Ronin: Why the Ashen Reaches Feel Alive$/i],
  ['/character/character-anime-kaida-nova', /^Kaida Nova$/i],
  ['/event/event-anime-starlit-ronin-convention', /^Starlit Ronin Fan Convention$/i],
  ['/product/merch-anime-blade-bearer-tee', /^Starlit Ronin Blade-Bearer Tee$/i],
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
    // shell — confirm the real app chrome (header nav) survived too. The
    // cinematic landing at `/` deliberately carries no app banner, so it is
    // checked by its own heading above instead.
    if (path !== '/') {
      await expect(page.getByRole('banner').getByRole('link', { name: 'FandomVerse' })).toBeVisible()
    }
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
