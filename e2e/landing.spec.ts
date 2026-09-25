import { test, expect } from '@playwright/test'

/**
 * Landing page gate — route `/`.
 *
 * `/` is the cinematic landing: the authored Kage experience booted into a
 * React route, carrying FandomVerse's seven worlds. This suite was previously
 * written against the React chapter landing that used to live here; the
 * guarantees below are the same ones, read against the page that is actually
 * routed now.
 *
 * What it guards, and why each earned a place:
 *
 *   1. Structure — a chapter disappearing, or the document losing its heading.
 *   2. Art — an image 404ing, or resolving to something that decodes to
 *      nothing, which on a dark composition looks merely moody rather than
 *      broken.
 *   3. Weight — an early build served the approved 2048px masters directly
 *      and measured 85.9 MB on one page (D-052). No master may be requested.
 *   4. Routing — every chapter must reach its real hub.
 *   5. Teardown — leaving `/` must not leave a WebGL context or a render loop
 *      running, which it did until the animation-frame shim was corrected.
 */

const CATEGORY_PATHS = ['anime', 'gaming', 'movies', 'tv-shows', 'k-pop', 'comics', 'manga'] as const
const CHAPTER_HEADINGS = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga'] as const

/** The scene is procedural and heavy; it needs real time on a cold server. */
async function waitForScene(page: import('@playwright/test').Page) {
  await page.waitForLoadState('load')
  await expect(page.getByTestId('kage-stage')).toBeAttached()
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const pre = document.querySelector('#pre')
          return pre ? getComputedStyle(pre).visibility : 'none'
        }),
      // Generous on purpose: this suite boots a full procedural 3D scene ten
      // times, and the runner puts four of them on parallel workers. A scene
      // that settles in ~6s alone can take far longer with three siblings
      // competing for the GPU. Nothing here is waiting on a product defect.
      { timeout: 90_000 },
    )
    .not.toBe('visible')
}

test.describe.configure({ timeout: 120_000 })

test.describe('landing page', () => {
  test('boots the cinematic scene with a live WebGL context', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    const scene = await page.evaluate(() => {
      const gl = document.querySelector('#gl') as HTMLCanvasElement | null
      const context = gl ? gl.getContext('webgl2') ?? gl.getContext('webgl') : null
      return {
        webgl: !!context,
        sections: document.querySelectorAll('[data-cam]').length,
        rail: document.querySelectorAll('#rail button').length,
      }
    })

    expect(scene.webgl).toBe(true)
    // Intro, seven chapters, colophon.
    expect(scene.sections).toBe(9)
    expect(scene.rail).toBe(9)
  })

  test('renders one heading and every chapter exactly once', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    for (const heading of CHAPTER_HEADINGS) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toHaveCount(1)
    }
  })

  test('every chapter links to its real hub', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    for (const path of CATEGORY_PATHS) {
      await expect(page.locator(`a[href="/#/${path}"]`).first()).toBeAttached()
    }
  })

  test('a chapter call to action navigates into the app', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    await page.evaluate(() => {
      const link = document.querySelector('a[href="/#/gaming"]') as HTMLAnchorElement | null
      link?.click()
    })

    await expect(page).toHaveURL(/#\/gaming$/)
    // Tearing the scene down and mounting the hub takes a moment.
    await expect(page.getByRole('heading', { level: 1, name: 'Gaming' })).toBeVisible({
      timeout: 20_000,
    })
  })

  test('leaving the landing tears the scene down completely', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    await page.evaluate(() => {
      const link = document.querySelector('a[href="/#/anime"]') as HTMLAnchorElement | null
      link?.click()
    })
    // URL first: tearing the scene down and mounting the hub takes a moment,
    // and the route changing is what this test actually depends on.
    await expect(page).toHaveURL(/#\/anime$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible({
      timeout: 20_000,
    })

    // A leaked canvas or a surviving foreground plane would mean the render
    // loop is still running against a released context.
    const leaked = await page.evaluate(() => ({
      canvases: document.querySelectorAll('#gl').length,
      stages: document.querySelectorAll('#fg-sky, #pre').length,
    }))
    expect(leaked).toEqual({ canvases: 0, stages: 0 })
  })

  test('every image decodes — no silently blank art', async ({ page }) => {
    await page.goto('/')
    await waitForScene(page)

    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute('src') ?? '(no src)'),
    )

    expect(broken).toEqual([])
  })

  test('never requests an approved master PNG', async ({ page }) => {
    const masters: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      // The masters are 2048px / 2752px PNGs of 5-8 MB each. The runtime must
      // only ever serve the derived WebP renditions (D-052).
      if (/\/assets\/gemini\/[^/]+\.png$/i.test(url)) masters.push(url)
    })

    await page.goto('/')
    await waitForScene(page)

    expect(masters).toEqual([])
  })

  test('reaches a settled scene without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

    await page.goto('/')
    await waitForScene(page)

    expect(errors).toEqual([])
  })

  test('does not overflow horizontally on a small phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/')
    await waitForScene(page)

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > doc.clientWidth + 1 ? `${doc.scrollWidth} > ${doc.clientWidth}` : null
    })

    expect(overflow).toBeNull()
  })

  test('keeps every chapter readable under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await waitForScene(page)

    // Reduced motion removes travel, never content.
    for (const heading of CHAPTER_HEADINGS) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toHaveCount(1)
    }
    for (const path of CATEGORY_PATHS) {
      await expect(page.locator(`a[href="/#/${path}"]`).first()).toBeAttached()
    }
  })
})
