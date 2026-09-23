import { test, expect } from '@playwright/test'

test.describe('Navigation foundation', () => {
  test('home page loads with a real heading, not a blank screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'FandomVerse' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Explore fandoms' })).toBeVisible()
  })

  test('navigating into a category hub works and updates the URL', async ({ page }) => {
    await page.goto('/')

    // On narrow viewports the category nav lives behind the hamburger
    // toggle (docs/03_UX_ARCHITECTURE.md §12); open it first if present.
    const mobileToggle = page.getByRole('button', { name: 'Toggle navigation menu' })
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click()
    }

    const categoryNav = page.getByRole('navigation', { name: 'Fandom categories' })
    await categoryNav.getByRole('link', { name: 'Anime' }).click()
    await expect(page).toHaveURL(/#\/anime$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()
  })

  test('browser back/forward works across route changes', async ({ page }) => {
    await page.goto('/#/anime')
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()

    await page.goto('/#/gaming')
    await expect(page.getByRole('heading', { level: 1, name: 'Gaming' })).toBeVisible()

    await page.goBack()
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()

    await page.goForward()
    await expect(page.getByRole('heading', { level: 1, name: 'Gaming' })).toBeVisible()
  })

  test('an unknown route renders the Not Found page', async ({ page }) => {
    await page.goto('/#/this-does-not-exist')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('breadcrumb trail appears on a category page and links back home', async ({ page }) => {
    await page.goto('/#/anime')
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible()
  })
})
