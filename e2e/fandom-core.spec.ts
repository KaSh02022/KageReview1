import { test, expect, type Page } from '@playwright/test'

/** Forces canvas.getContext('webgl'/'webgl2') to return null, simulating a WebGL-unavailable browser (Director Phase 4 §9/§10/§17). */
async function disableWebgl(page: Page) {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    // @ts-expect-error — intentionally narrowing the overload for the test-only WebGL-disable shim
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2') return null
      return originalGetContext.call(this, type, ...args)
    }
  })
}

const CATEGORY_LABELS = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga']

test.describe('Fandom Core — Home cinematic entry', () => {
  test('Home loads with the Fandom Core visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'FandomVerse' })).toBeVisible()
    await expect(page.getByTestId('fandom-core-fallback')).toBeVisible()
  })

  test('the WebGL canvas loads when WebGL is supported', async ({ page }) => {
    await page.goto('/')
    // Headless Chromium/Firefox/WebKit in this CI environment support
    // WebGL (SwiftShader/software rendering) — the canvas should mount.
    await expect(page.locator('[data-testid="fandom-core-canvas"] canvas')).toBeVisible({ timeout: 10_000 })
  })

  test('falls back to the 2D Fandom Core when WebGL is unavailable — no broken canvas', async ({ page }) => {
    await disableWebgl(page)
    await page.goto('/')
    await expect(page.getByTestId('fandom-core-fallback')).toBeVisible()
    await expect(page.locator('[data-testid="fandom-core-canvas"]')).toHaveCount(0)
    // Every category is still reachable — the fallback "must look
    // intentional... not an error page" and must not lose navigation.
    for (const label of CATEGORY_LABELS) {
      await expect(page.getByRole('link', { name: `Explore ${label}` })).toBeVisible()
    }
  })

  test('reduced motion: no WebGL canvas, all navigation preserved', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByTestId('fandom-core-fallback')).toBeVisible()
    await expect(page.locator('[data-testid="fandom-core-canvas"]')).toHaveCount(0)
    for (const label of CATEGORY_LABELS) {
      await expect(page.getByRole('link', { name: `Explore ${label}` })).toBeVisible()
    }
  })

  test('all seven category controls are present with correct navigation targets', async ({ page }) => {
    await page.goto('/')
    // HashRouter Link hrefs render as "#/path" (see routes.tsx).
    const expectedPaths: Record<string, string> = {
      Anime: '#/anime',
      Gaming: '#/gaming',
      Movies: '#/movies',
      'TV Shows': '#/tv-shows',
      'K-Pop': '#/k-pop',
      Comics: '#/comics',
      Manga: '#/manga',
    }
    for (const [label, path] of Object.entries(expectedPaths)) {
      const link = page.getByRole('link', { name: `Explore ${label}` })
      await expect(link).toHaveAttribute('href', path)
    }
  })

  test('pointer/tap activation navigates to the category route', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Explore Gaming' }).click()
    await expect(page).toHaveURL(/#\/gaming$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Gaming' })).toBeVisible()
  })

  test('keyboard activation (Tab + Enter) navigates to the category route', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'Explore Comics' })
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/comics$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Comics' })).toBeVisible()
  })

  test('skip-intro control moves focus to the category grid without navigating away', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /skip intro/i }).click()
    // Regression coverage for D-032: activating a plain `href="#id"`
    // anchor must never corrupt HashRouter's route state — confirmed by
    // staying on Home (not Not Found) while focus moves to the target.
    await expect(page.getByRole('heading', { level: 1, name: 'FandomVerse' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page not found' })).not.toBeVisible()
    await expect(page.locator('#fandom-categories-section')).toBeFocused()
  })

  test('no console errors or unexpected failed requests while the Fandom Core is active', async ({ page }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('requestfailed', (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`))
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`http ${res.status()} ${res.url()}`)
    })

    await page.goto('/')
    await expect(page.locator('[data-testid="fandom-core-canvas"] canvas')).toBeVisible({ timeout: 10_000 })
    // Exercise hover/parallax/interaction briefly.
    await page.mouse.move(200, 200)
    await page.mouse.move(600, 400)
    await page.getByRole('link', { name: 'Explore Anime' }).hover()
    await page.waitForTimeout(300)

    expect(consoleErrors, JSON.stringify(consoleErrors)).toEqual([])
    expect(failedRequests, JSON.stringify(failedRequests)).toEqual([])
  })
})
