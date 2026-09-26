import { test, expect, type Page } from '@playwright/test'

/**
 * Storage-boundary checks. These navigate through the UI rather than
 * deep-linking to hardcoded content ids: Phase 5 replaced the Phase 1 seed
 * dataset wholesale, which silently invalidated every hardcoded id in this
 * file. Reaching the pages the way a user does keeps the suite testing
 * persistence instead of testing whether a particular fixture still exists.
 */

/**
 * Opens the first card in the named section of a category hub, and waits
 * for the detail route to actually mount. Returning on the click alone let
 * a slow device read the hub's own heading as if it were the detail page's.
 */
async function openFirstCardIn(page: Page, hubPath: string, sectionHeading: RegExp) {
  await page.goto(`/#${hubPath}`)
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: sectionHeading }) })
  const hubUrl = page.url()
  const hubHeading = await page.getByRole('heading', { level: 1 }).textContent()

  await section.getByRole('link').first().click()
  await expect.poll(() => page.url()).not.toBe(hubUrl)

  // The URL changes a beat before React swaps the heading, so waiting on
  // the URL alone still handed callers the hub's own <h1>. Wait for the
  // heading itself to become the detail page's.
  await expect
    .poll(() => page.getByRole('heading', { level: 1 }).textContent())
    .not.toBe(hubHeading)
}

test.describe('Storage persistence boundaries', () => {
  test('cart persists across a page reload via localStorage (D-005)', async ({ page }) => {
    await openFirstCardIn(page, '/anime', /^merchandise$/i)
    const productName = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
    expect(productName).not.toBe('')

    await page.getByRole('button', { name: 'Add to cart' }).click()
    await page.reload()
    // Let the reload settle before navigating on. Under a loaded worker the
    // cart route could otherwise be requested while the reload was still in
    // flight, and win the race.
    await page.waitForLoadState('load')

    await page.goto('/#/cart')
    await expect(page.getByText(productName, { exact: false })).toBeVisible()
  })

  test('bookmark persists across a page reload via localStorage (FR-036)', async ({ page }) => {
    await openFirstCardIn(page, '/anime', /^articles$/i)
    await page.getByRole('button', { name: /^Bookmark$/ }).click()
    await expect(page.getByRole('button', { name: /^Bookmarked$/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: /^Bookmarked$/ })).toBeVisible()
  })

  test('a bookmark note is readable within the session on the Bookmarks page (FR-037)', async ({
    page,
  }) => {
    await openFirstCardIn(page, '/anime', /^articles$/i)
    await page.getByRole('button', { name: /^Bookmark$/ }).click()

    await page.goto('/#/bookmarks')
    // Placeholder reworded 2026-09-26 (UI/Copy Cleanup) from "Personal note
    // (this session only)" to drop the technical "session" wording — this
    // test was missed in that session's own validation pass and is fixed
    // here as a genuine, if belated, regression fix.
    const note = page.getByPlaceholder('Add a personal note')
    await note.fill('Architecture verification note')
    await expect(note).toHaveValue('Architecture verification note')
  })
})
