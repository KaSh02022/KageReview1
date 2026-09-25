import { test, expect, type Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * Phase 5 category-hub coverage (Director's Phase 5 §25): verifies the
 * SRS content minimums actually reach the screen, that hub cards really
 * navigate to their detail routes, that no declared image 404s, and that
 * the hubs hold up responsively and accessibly. The dataset-level
 * guarantees (counts, references, provenance) are asserted in
 * src/data/contentValidation.test.ts — this suite is about what a real
 * browser actually renders.
 */

const CATEGORY_HUBS = [
  { path: '/anime', name: 'Anime' },
  { path: '/gaming', name: 'Gaming' },
  { path: '/movies', name: 'Movies' },
  { path: '/tv-shows', name: 'TV Shows' },
  { path: '/k-pop', name: 'K-Pop' },
  { path: '/comics', name: 'Comics' },
  { path: '/manga', name: 'Manga' },
]

const SECTION_HEADINGS = [
  /^start here:/i,
  /^articles$/i,
  /^gallery$/i,
  /^characters$/i,
  /^events$/i,
  /^trailers$/i,
  /^upcoming releases$/i,
  /^merchandise$/i,
  /^explore another world$/i,
]

/**
 * Asserts the section whose heading matches `heading` renders at least
 * `minimum` card links.
 *
 * This polls rather than sampling the count once: under WebKit a hash-route
 * navigation can re-render the hub between the locator resolving and the
 * count being read, which intermittently reported 0 links on a section that
 * was demonstrably populated. Polling asserts the count the page settles on,
 * which is the thing actually under test.
 */
async function expectSectionLinkCount(page: Page, heading: RegExp, minimum: number) {
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: heading }) })
  await expect
    .poll(() => section.getByRole('link').count(), {
      message: `section matching ${heading} should render at least ${minimum} links`,
    })
    .toBeGreaterThanOrEqual(minimum)
}

test.describe('Category hubs — structure and content minimums', () => {
  for (const hub of CATEGORY_HUBS) {
    test(`${hub.name} hub renders the full shared section structure`, async ({ page }) => {
      await page.goto(`/#${hub.path}`)

      await expect(page.getByRole('heading', { level: 1, name: hub.name })).toBeVisible()
      for (const heading of SECTION_HEADINGS) {
        await expect(page.getByRole('heading', { name: heading })).toBeVisible()
      }
    })

    test(`${hub.name} hub shows at least 5 characters and 3 events (SRS minimums)`, async ({ page }) => {
      await page.goto(`/#${hub.path}`)

      await expectSectionLinkCount(page, /^characters$/i, 5)
      await expectSectionLinkCount(page, /^events$/i, 3)
    })
  }

  test('every hub image actually loads — no broken or 404 images', async ({ page }) => {
    const failedRequests: string[] = []
    page.on('response', (response) => {
      if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`)
    })

    for (const hub of CATEGORY_HUBS) {
      await page.goto(`/#${hub.path}`)
      await page.waitForLoadState('networkidle')

      // Force lazy images into view so they genuinely load before we check them.
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => setTimeout(resolve, 150))
        window.scrollTo(0, 0)
      })
      await page.waitForLoadState('networkidle')

      const broken = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute('src') ?? '(no src)'),
      )
      expect(broken, `${hub.name} has broken images`).toEqual([])
    }

    expect(failedRequests).toEqual([])
  })
})

test.describe('Category hubs — route/content integration', () => {
  test('a character card navigates to that character’s detail page', async ({ page }) => {
    await page.goto('/#/anime')
    const charactersSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^characters$/i }) })
    const firstCharacter = charactersSection.getByRole('link').first()
    // The card's heading is the character's name; the link's full text also
    // includes the role, so read the heading rather than the whole link.
    const name = (await firstCharacter.getByRole('heading').textContent())?.trim() ?? ''
    expect(name).not.toBe('')

    await firstCharacter.click()
    await expect(page).toHaveURL(/#\/character\//)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  })

  test('an event card navigates to that event’s detail page, labelled as simulated', async ({ page }) => {
    await page.goto('/#/k-pop')
    const eventsSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^events$/i }) })

    const firstEvent = eventsSection.getByRole('link').first()
    const title = (await firstEvent.getByRole('heading').textContent())?.trim() ?? ''
    expect(title).not.toBe('')

    await firstEvent.click()
    await expect(page).toHaveURL(/#\/event\//)
    // Wait for the detail page itself to render before asserting the badge.
    // `toHaveURL` resolves as soon as the hash changes, while the hub — which
    // shows one "Simulated fan event" badge per event card — is still mounted,
    // so asserting too early hits three matches instead of the detail page's one.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(page.getByText(/simulated fan event/i)).toBeVisible()
  })

  test('a merchandise card navigates to the product page with a working demo cart', async ({ page }) => {
    await page.goto('/#/comics')
    const merchSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^merchandise$/i }) })

    const firstProduct = merchSection.getByRole('link').first()
    await expect(firstProduct).toBeVisible()
    await firstProduct.click()
    await expect(page).toHaveURL(/#\/product\//)
    await expect(page.getByText(/no checkout, payment, or real purchase/i)).toBeVisible()
  })

  test('detail pages set a document title naming the item, not a generic label', async ({ page }) => {
    await page.goto('/#/anime')
    const charactersSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^characters$/i }) })

    const firstCharacterLink = charactersSection.getByRole('link').first()
    await expect(firstCharacterLink).toBeVisible()
    await firstCharacterLink.click()
    await expect(page).toHaveURL(/#\/character\//)
    const heading = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
    await expect(page).toHaveTitle(new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  })

  test('the back-to-hub link on a detail page returns to the right category', async ({ page }) => {
    await page.goto('/#/manga')
    const charactersSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^characters$/i }) })

    const firstCharacterLink = charactersSection.getByRole('link').first()
    await expect(firstCharacterLink).toBeVisible()
    await firstCharacterLink.click()
    await page.getByRole('link', { name: /back to manga/i }).click()
    await expect(page).toHaveURL(/#\/manga$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Manga' })).toBeVisible()
  })
})

test.describe('Category hubs — Fandom Core integration', () => {
  for (const hub of CATEGORY_HUBS) {
    test(`the Fandom Core ${hub.name} node navigates to the ${hub.name} hub`, async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: `Explore ${hub.name}` }).click()
      await expect(page).toHaveURL(new RegExp(`#${hub.path}$`))
      await expect(page.getByRole('heading', { level: 1, name: hub.name })).toBeVisible()
    })
  }
})

test.describe('Category hubs — accessibility', () => {
  test('a category hub has no critical or serious axe violations', async ({ page }) => {
    await page.goto('/#/anime')
    const results = await new AxeBuilder({ page }).analyze()
    const seriousOrCritical = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })

  test('a character detail page has no critical or serious axe violations', async ({ page }) => {
    await page.goto('/#/anime')
    const characterLink = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^characters$/i }) })
      .getByRole('link')
      .first()
    await expect(characterLink).toBeVisible()
    await characterLink.click()

    const results = await new AxeBuilder({ page }).analyze()
    const seriousOrCritical = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })

  test('hub headings form a single-h1, no-skipped-level hierarchy', async ({ page }) => {
    await page.goto('/#/gaming')

    // Poll the whole outline rather than snapshotting it once: reading the
    // DOM mid-paint under WebKit yielded a partial heading list, which then
    // failed the single-h1 check for reasons unrelated to the markup.
    const readOutline = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('main :is(h1,h2,h3,h4,h5,h6)')).map((node) =>
          Number(node.tagName.slice(1)),
        ),
      )

    await expect
      .poll(async () => (await readOutline()).length, { message: 'hub heading outline should finish rendering' })
      .toBeGreaterThanOrEqual(SECTION_HEADINGS.length + 1)

    const levels = await readOutline()
    expect(levels.filter((level) => level === 1), 'exactly one h1 per page').toHaveLength(1)
    expect(levels[0], 'the first heading in main should be the h1').toBe(1)
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `heading jumped from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1)
    }
  })

  test('category identity is available as text, not colour alone', async ({ page }) => {
    await page.goto('/#/comics')
    // The accent colour is decorative; the category must be identifiable from
    // text alone. Two independent signals are asserted: the name and the
    // franchise.
    //
    // `visualMotif` used to be the third. The cinematic hero drops it by
    // design (D-055): "Halftone dots and ink-bleed shadows" is art direction
    // written to brief an image generator, not something a reader can use.
    // The guarantee this test exists for is unchanged — identity is still
    // carried by text, and by more than one piece of it.
    await expect(page.getByRole('heading', { level: 1, name: 'Comics' })).toBeVisible()
    await expect(page.getByText(/Ironclad Vanguard/i).first()).toBeVisible()
    await expect(page.getByText(/panels, ink, and legends/i).first()).toBeVisible()
  })
})

const HUB_VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-portrait-768', width: 768, height: 1024 },
  { name: 'tablet-landscape-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

for (const viewport of HUB_VIEWPORTS) {
  test.describe(`Category hubs — responsive ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('no horizontal overflow on a fully populated hub', async ({ page }) => {
      await page.goto('/#/anime')
      await page.waitForLoadState('networkidle')
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })

    test('no horizontal overflow on a detail page', async ({ page }) => {
      await page.goto('/#/anime')
      const detailLink = page
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: /^characters$/i }) })
        .getByRole('link')
        .first()
      await expect(detailLink).toBeVisible()
      await detailLink.click()
      await page.waitForLoadState('networkidle')

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  })
}
