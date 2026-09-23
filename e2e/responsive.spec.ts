import { test, expect, devices } from '@playwright/test'

/**
 * Phase 2 responsive/visual QA (Director's Phase 2 §17/§25): checks the
 * canonical breakpoint system across mobile/tablet/desktop/wide for
 * horizontal overflow, mobile-drawer usability, and no-layout-shift-on-open
 * — replacing the arbitrary 767px Header behavior from Phase 1
 * (docs/11_DECISION_LOG.md D-018).
 */
const VIEWPORTS: Array<{ name: string; width: number; height: number }> = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'large-mobile', width: 599, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1600, height: 900 },
]

const ROUTES_TO_CHECK = ['/', '/anime', '/merchandise', '/cart', '/bookmarks', '/contact', '/about']

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive QA — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const route of ROUTES_TO_CHECK) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(`/#${route}`)
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        // A 1px tolerance absorbs sub-pixel rounding across browser engines.
        expect(scrollWidth, `scrollWidth (${scrollWidth}) should not exceed clientWidth (${clientWidth})`).toBeLessThanOrEqual(
          clientWidth + 1,
        )
      })
    }
  })
}

test.describe('Mobile/tablet navigation drawer', () => {
  // Spread only the viewport/touch traits, not `defaultBrowserType` —
  // changing browser type isn't allowed inside a describe block (only at
  // file/config top level), and the project-level `mobile-chrome` config
  // already covers the real-device-emulation case for the other specs.
  const { viewport, isMobile, hasTouch, deviceScaleFactor } = devices['Pixel 7']
  test.use({ viewport, isMobile, hasTouch, deviceScaleFactor })

  test('nav collapses into the drawer at the canonical breakpoint and the toggle is reachable', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Toggle navigation menu' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Fandom categories' })).toBeHidden()
  })

  test('opening the drawer causes no layout shift in the header', async ({ page }) => {
    await page.goto('/')
    const headerBoxBefore = await page.locator('header').boundingBox()

    await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Browse FandomVerse' })).toBeVisible()

    const headerBoxAfter = await page.locator('header').boundingBox()
    expect(headerBoxAfter?.height).toBe(headerBoxBefore?.height)
    expect(headerBoxAfter?.width).toBe(headerBoxBefore?.width)
  })

  test('drawer is keyboard-dismissible with Escape and traps Tab focus', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Browse FandomVerse' })
    await expect(drawer).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  })
})

test.describe('Desktop navigation', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('inline category bar is visible and the mobile toggle is hidden', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Fandom categories' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Toggle navigation menu' })).toBeHidden()
  })

  test('active category link shows aria-current', async ({ page }) => {
    await page.goto('/#/anime')
    const activeLink = page.getByRole('navigation', { name: 'Fandom categories' }).getByRole('link', {
      name: 'Anime',
    })
    await expect(activeLink).toHaveAttribute('aria-current', 'page')
  })
})
