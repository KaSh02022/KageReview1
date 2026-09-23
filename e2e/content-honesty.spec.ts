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
  '/product/merch-anime-kaida-figure',
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
  await page.waitForLoadState('networkidle')
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

    await page.goto('/#/product/merch-anime-kaida-figure')
    await expect(page.getByText(/no checkout, payment, or real purchase/i)).toBeVisible()
  })

  test('the cart states it is temporary and browser-local', async ({ page }) => {
    const text = await visibleText(page, '/cart')
    expect(text).toMatch(/temporary/i)
    expect(text).toMatch(/no checkout, payment, or real purchase/i)
  })

  test('trailers state that no video is available rather than implying playback', async ({ page }) => {
    const text = await visibleText(page, '/trailers')
    expect(text).toMatch(/no video to play|not real footage|demonstrative/i)
  })

  test('the contact page does not present a fabricated real-world address', async ({ page }) => {
    const text = await visibleText(page, '/contact')
    expect(text).toMatch(/no public office|illustrative|student/i)
  })

  test('the dummy auth dialog states it does not create a real account', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /log in \/ sign up/i }).click()
    await expect(page.getByText(/does not authenticate you|create a real account/i)).toBeVisible()
  })
})
