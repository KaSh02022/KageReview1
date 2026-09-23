import { test, expect } from '@playwright/test'

test.describe('Storage persistence boundaries', () => {
  test('cart persists across a page reload via localStorage (D-005)', async ({ page }) => {
    await page.goto('/#/product/merch-anime-sample-01')
    await page.getByRole('button', { name: 'Add to cart' }).click()

    await page.reload()
    await page.goto('/#/cart')
    await expect(page.getByText('Sample T-Shirt', { exact: false })).toBeVisible()
  })

  test('bookmark persists across a page reload via localStorage (FR-036)', async ({ page }) => {
    await page.goto('/#/article/article-anime-sample-01')
    await page.getByRole('button', { name: /^Bookmark$/ }).click()
    await expect(page.getByRole('button', { name: /^Bookmarked$/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: /^Bookmarked$/ })).toBeVisible()
  })

  test('a bookmark note is readable within the session on the Bookmarks page (FR-037)', async ({
    page,
  }) => {
    await page.goto('/#/article/article-anime-sample-01')
    await page.getByRole('button', { name: /^Bookmark$/ }).click()

    await page.goto('/#/bookmarks')
    const note = page.getByPlaceholder('Personal note (this session only)')
    await note.fill('Architecture verification note')
    await expect(note).toHaveValue('Architecture verification note')
  })
})
