import { test, expect, type Page } from '@playwright/test'

/**
 * Storage-boundary checks. These navigate through the UI rather than
 * deep-linking to hardcoded content ids: Phase 5 replaced the Phase 1 seed
 * dataset wholesale, which silently invalidated every hardcoded id in this
 * file. Reaching the pages the way a user does keeps the suite testing
 * persistence instead of testing whether a particular fixture still exists.
 */

/** Opens the first card in the named section of a category hub. */
async function openFirstCardIn(page: Page, hubPath: string, sectionHeading: RegExp) {
  await page.goto(`/#${hubPath}`)
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: sectionHeading }) })
  await section.getByRole('link').first().click()
}

test.describe('Storage persistence boundaries', () => {
  test('cart persists across a page reload via localStorage (D-005)', async ({ page }) => {
    await openFirstCardIn(page, '/anime', /^merchandise$/i)
    const productName = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
    expect(productName).not.toBe('')

    await page.getByRole('button', { name: 'Add to cart' }).click()
    await page.reload()
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
    const note = page.getByPlaceholder('Personal note (this session only)')
    await note.fill('Architecture verification note')
    await expect(note).toHaveValue('Architecture verification note')
  })
})
