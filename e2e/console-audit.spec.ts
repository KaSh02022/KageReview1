import { test, expect } from '@playwright/test'

const ROUTES = [
  '/', '/anime', '/gaming', '/movies', '/tv-shows', '/k-pop', '/comics', '/manga',
  '/search', '/trailers', '/events', '/releases', '/merchandise', '/cart',
  '/bookmarks', '/contact', '/about',
  '/article/article-anime-why-the-ashen-reaches-feel-alive', '/character/character-anime-kaida-nova',
  '/event/event-anime-starlit-ronin-convention', '/product/merch-anime-blade-bearer-tee',
]

test('console/network audit across all primary routes', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const failedRequests: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[console.error] ${msg.text()}`)
  })
  page.on('pageerror', (err) => pageErrors.push(`[pageerror] ${err.message}`))
  // Third-party embeds (Google Maps on Contact Us, per D-006) are outside
  // FandomVerse's control and may be blocked by sandbox/CI network
  // policies without indicating an app bug — the rest of the page must
  // still work when that happens (graceful degradation), so those
  // requests are excluded from this first-party audit.
  const isThirdPartyEmbed = (url: string) => url.includes('google.com/maps')

  page.on('requestfailed', (req) => {
    if (isThirdPartyEmbed(req.url())) return
    failedRequests.push(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`)
  })
  page.on('response', (res) => {
    if (isThirdPartyEmbed(res.url())) return
    if (res.status() >= 400) failedRequests.push(`[http ${res.status()}] ${res.url()}`)
  })

  for (const route of ROUTES) {
    await page.goto(`/#${route}`)
    await page.waitForTimeout(300)
  }

  console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors, null, 2))
  console.log('PAGE_ERRORS:', JSON.stringify(pageErrors, null, 2))
  console.log('FAILED_REQUESTS:', JSON.stringify(failedRequests, null, 2))

  expect(pageErrors).toEqual([])
  expect(failedRequests).toEqual([])
})
