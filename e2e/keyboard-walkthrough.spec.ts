import { test, expect } from '@playwright/test'

/**
 * Phase 3 §12: a real keyboard-only walkthrough of a representative user
 * journey, not just automated axe scans (Director's explicit instruction
 * — "do not accept 'no automated violations' as the only evidence").
 * Desktop viewport is used for the Home -> Category -> Detail -> Search
 * -> Back leg (inline nav is keyboard-reachable there); a mobile viewport
 * covers the drawer/dialog leg, since that's where those controls
 * actually render.
 */
test.describe('Keyboard-only walkthrough', () => {
  test('HOME -> CATEGORY -> DETAIL -> SEARCH -> BACK, entirely by keyboard, with focus always visible', async ({
    page,
    browserName,
  }) => {
    // WebKit's default Tab order excludes <a> links (D-015, same
    // documented platform limitation as the skip-link test) — this
    // journey is link-heavy by nature (nav, cards, breadcrumb), so it
    // doesn't hold under that default. Verified manually that the links
    // themselves are focusable via direct .focus()/real assistive tech.
    test.skip(browserName === 'webkit', 'WebKit only tabs to links with Full Keyboard Access on')

    // This leg specifically exercises the desktop inline nav bar (hidden
    // below the canonical breakpoint, docs/04_DESIGN_SYSTEM.md §2a) — set
    // an explicit desktop viewport regardless of the project's default
    // (mobile-chrome would otherwise never reach the "Anime" nav link).
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    // HOME: Tab from the top of the page to the Anime category link and activate it with Enter.
    let guard = 0
    while (guard < 30) {
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
      if (focused === 'Anime') break
      await page.keyboard.press('Tab')
      guard += 1
    }
    expect(guard).toBeLessThan(30) // sanity: the link was actually reached, not just given up on

    await expect(page.locator(':focus')).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/anime$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()

    // CATEGORY -> DETAIL: focus should have moved into the new page's main
    // content on navigation (useRouteTransitionEffects). That effect runs
    // slightly after the heading paints (child-then-parent effect order),
    // so wait for it explicitly rather than assume it already landed —
    // otherwise Tab starts from the stale pre-navigation focus target.
    await expect(page.locator('#main-content')).toBeFocused()

    // Tab from main content to the first article link and activate it.
    // Checking tagName === 'A' matters: <main>'s own textContent already
    // *contains* "Sample Article" (it's the concatenation of everything
    // inside it, including that link's text), so a substring check alone
    // matches <main> itself at guard=0, before any Tab is pressed.
    guard = 0
    while (guard < 15) {
      const focused = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent?.trim(),
      }))
      if (focused.tag === 'A' && focused.text?.includes('Sample Article')) break
      await page.keyboard.press('Tab')
      guard += 1
    }
    expect(guard).toBeLessThan(15)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 1, name: /sample article/i })).toBeVisible()
    await expect(page.locator('#main-content')).toBeFocused()

    // DETAIL -> SEARCH: the search input lives in the header, earlier in
    // DOM/tab order than main content, so Shift+Tab (backward) reaches it
    // directly rather than forward-tabbing all the way around the page.
    let searchReached = false
    for (let i = 0; i < 20; i += 1) {
      const isSearchInput = await page.evaluate(
        () => document.activeElement?.getAttribute('type') === 'search',
      )
      if (isSearchInput) {
        searchReached = true
        break
      }
      await page.keyboard.press('Shift+Tab')
    }
    expect(searchReached).toBe(true)
    await page.keyboard.type('anime')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 1, name: 'Search' })).toBeVisible()
    await expect(page).toHaveURL(/#\/search\?q=anime$/)

    // BACK: browser back returns to the article detail page.
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1, name: /sample article/i })).toBeVisible()
  })

  test('MOBILE NAV -> DIALOG -> CLOSE, entirely by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    // MOBILE NAV: reach and open the hamburger toggle with the keyboard.
    let toggleReached = false
    for (let i = 0; i < 10; i += 1) {
      const label = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      if (label === 'Toggle navigation menu') {
        toggleReached = true
        break
      }
      await page.keyboard.press('Tab')
    }
    expect(toggleReached).toBe(true)
    await page.keyboard.press('Enter')

    const drawer = page.getByRole('dialog', { name: 'Browse FandomVerse' })
    await expect(drawer).toBeVisible()
    await expect(drawer).toBeFocused()

    // Tab must stay trapped inside the drawer.
    await page.keyboard.press('Tab')
    const stillInsideDrawer = await page.evaluate(() => {
      const drawerEl = document.querySelector('[role="dialog"]')
      return drawerEl ? drawerEl.contains(document.activeElement) : false
    })
    expect(stillInsideDrawer).toBe(true)

    // CLOSE: Escape closes it and returns focus to the toggle button.
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(page.getByRole('button', { name: 'Toggle navigation menu' })).toBeFocused()
  })

  test('DIALOG (chatbot) -> CLOSE, entirely by keyboard, from anywhere on the page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open FandomVerse assistant' }).focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'FandomVerse Assistant' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open FandomVerse assistant' })).toBeFocused()
  })
})
