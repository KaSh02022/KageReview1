import { test, expect, type Page } from '@playwright/test'

/**
 * Phase 5C content-honesty gate.
 *
 * A Phase 5C screenshot review found internal project scaffolding rendered
 * in the user-facing UI — "Requirements: FR-029, FR-030, FR-031" on the
 * Cart page, SRS requirement ids embedded in page descriptions, and the
 * Phase 1 address string "Seed City, Placeholder Region" on Contact. None
 * of it was caught by any existing test, because every test asserted on
 * what *should* be present and nothing asserted on what must never appear.
 *
 * This suite is the inverse check: it reads the rendered text of every
 * primary route and fails if developer-facing scaffolding, placeholder
 * copy, or an unlabelled fictional claim reaches a visitor.
 */

const ROUTES = [
  '/',
  '/anime',
  '/gaming',
  '/movies',
  '/tv-shows',
  '/k-pop',
  '/comics',
  '/manga',
  '/search',
  '/search?q=a',
  '/trailers',
  '/events',
  '/releases',
  '/merchandise',
  '/cart',
  '/bookmarks',
  '/contact',
  '/about',
  '/character/character-anime-kaida-nova',
  '/event/event-anime-starlit-ronin-convention',
  '/article/article-anime-why-the-ashen-reaches-feel-alive',
  // Product id updated 2026-09-25: the placeholder catalogue this pointed at
  // (merch-anime-kaida-figure) was replaced by real merchandise photography
  // (docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md, Merchandise Asset Integration).
  // The assertion below is unchanged — only the id moved.
  '/product/anime-merch-01',
]

/** Patterns that must never appear in text a visitor can read. */
const FORBIDDEN: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /\bFR-\d{3}\b/, why: 'SRS requirement id leaked into the UI' },
  { pattern: /\bNFR-\d{3}\b/, why: 'SRS requirement id leaked into the UI' },
  { pattern: /\bD-\d{3}\b/, why: 'decision-log id leaked into the UI' },
  { pattern: /Requirements:/i, why: 'internal requirements list leaked into the UI' },
  { pattern: /Implemented in:/i, why: 'internal phase metadata leaked into the UI' },
  { pattern: /\bPhase \d+\b/, why: 'internal phase reference leaked into the UI' },
  { pattern: /docs\/\d{2}_/, why: 'internal documentation path leaked into the UI' },
  { pattern: /lorem ipsum/i, why: 'placeholder copy' },
  { pattern: /\bTODO\b|\bFIXME\b/, why: 'developer marker' },
  { pattern: /Placeholder Region|Seed City|seed data|sample article/i, why: 'Phase 1 placeholder content' },
  { pattern: /\bXXX\b/, why: 'developer marker' },
]

async function visibleText(page: Page, route: string) {
  await page.goto(`/#${route}`)
  // `networkidle` alone cannot be relied on here: /contact embeds a
  // third-party map whose font and tile requests never settle in this
  // environment, so the wait timed out before anything was asserted. Take
  // quiet if it arrives, then wait for the route's own heading, which is
  // what actually signals the page has rendered.
  // Bounded: an unbounded `networkidle` does not reject until the whole test
  // times out, so catching it achieves nothing. Three seconds is quiet enough
  // for every route that can go quiet, and fails fast for the one that cannot.
  await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {})
  await page.locator('h1').first().waitFor({ state: 'visible' })
  return page.evaluate(() => document.body.innerText)
}

test.describe('Content honesty — no developer scaffolding reaches the visitor', () => {
  for (const route of ROUTES) {
    test(`${route} contains no internal scaffolding or placeholder copy`, async ({ page }) => {
      const text = await visibleText(page, route)
      const violations = FORBIDDEN.filter(({ pattern }) => pattern.test(text)).map(
        ({ pattern, why }) => `${why} — matched ${pattern} on ${route}`,
      )
      expect(violations, violations.join('\n')).toEqual([])
    })
  }
})

test.describe('Content honesty — fiction is labelled as fiction', () => {
  test('events are explicitly labelled as simulated, not real', async ({ page }) => {
    await page.goto('/#/event/event-anime-starlit-ronin-convention')
    await expect(page.getByText(/simulated fan event/i)).toBeVisible()
  })

  test('the events listing states that the events are fictional', async ({ page }) => {
    const text = await visibleText(page, '/events')
    expect(text).toMatch(/fictional|simulated/i)
  })

  test('merchandise never implies a real purchase is possible', async ({ page }) => {
    const text = await visibleText(page, '/merchandise')
    expect(text).toMatch(/no checkout|cannot be bought|demo cart/i)

    await page.goto('/#/product/anime-merch-01')
    await expect(page.getByText(/no checkout, payment, or real purchase/i)).toBeVisible()
  })

  test('the cart page renders with its current copy', async ({ page }) => {
    // Was "the cart states it is temporary and browser-local", checking
    // for a storage/technical disclaimer. Cart's copy was rewritten
    // 2026-09-26 (UI/Copy Cleanup) to drop that disclaimer entirely — a
    // deliberate director decision; the cart's actual behaviour
    // (local-only, no real purchase) is unchanged, it's just no longer
    // stated in the UI text. This no longer asserts a "fiction labelled
    // as fiction" guarantee, just that the page renders its current copy
    // rather than the old, now-inaccurate text.
    const text = await visibleText(page, '/cart')
    expect(text).toMatch(/your cart is empty/i)
    expect(text).toMatch(/explore the merchandise collection/i)
  })

  test('trailers state that no video is available rather than implying playback', async ({ page }) => {
    const text = await visibleText(page, '/trailers')
    expect(text).toMatch(/no video to play|not real footage|demonstrative/i)
  })

  test('the contact page does not present a fabricated real-world address', async ({ page }) => {
    const text = await visibleText(page, '/contact')
    expect(text).toMatch(/no public office|illustrative|student/i)
  })

  test('logging in is a local UI state change, not real navigation or a network call', async ({
    page,
  }) => {
    // Was "the dummy auth dialog states it does not create a real
    // account", asserting an in-dialog text disclaimer. That disclaimer
    // was removed 2026-09-26 (UI/Copy Cleanup, director decision) along
    // with all "(demo)" wording, so the dialog no longer says this in
    // words — but the underlying guarantee (no real account, no network
    // request) is unchanged, so this now asserts it behaviourally
    // instead: submitting the form does not navigate away and issues no
    // request, and the header flips to a real "Log out" control,
    // confirming the whole exchange stayed local.
    const requests: string[] = []
    page.on('request', (request) => {
      if (!request.url().startsWith('data:')) requests.push(request.url())
    })

    await page.goto('/#/anime')
    await page.waitForLoadState('networkidle').catch(() => {})
    const urlBeforeSubmit = page.url()
    await page.getByRole('button', { name: /^log in$/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: /welcome back/i })).toBeVisible()

    requests.length = 0 // only count requests made *after* the page/dialog have settled
    // Scoped to the dialog: the header's own "Log in" trigger button has
    // the same accessible name as the dialog's submit button.
    await dialog.getByRole('button', { name: /^log in$/i }).click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('button', { name: /^log out$/i })).toBeVisible()
    expect(page.url()).toBe(urlBeforeSubmit)
    expect(requests).toEqual([])
  })
})
