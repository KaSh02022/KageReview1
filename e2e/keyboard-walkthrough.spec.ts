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
/**
 * Where these tests start.
 *
 * This suite exercises the app shell — header, category nav, drawer, dialogs,
 * skip link — not any particular page. It used to enter at `/` because that
 * was the cheapest page carrying the chrome. `/` is now the cinematic
 * landing, which deliberately stands the shell down, so these enter at a
 * category hub instead. Every assertion is unchanged; only the door moved.
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

    // Enter at a hub, not at `/`. The describe block above already states
    // that these tests moved off `/` when it became the cinematic landing;
    // this one leg was missed. It matters for two reasons, both of which made
    // it fail or pass by luck depending on machine speed:
    //
    //   1. `/` stands the shell down, so the inline category nav this leg
    //      exists to exercise is not on the page at all;
    //   2. during the landing's intro the engine holds `is-locked` on <body>
    //      and Tab never leaves BODY, and once it does boot the landing's own
    //      link reads "Anime01" (label + chapter number), which can never
    //      equal the "Anime" compared against below.
    //
    // Gaming, so that "Anime" is a real destination rather than the current
    // page. Every assertion below is unchanged.
    await page.goto('/#/gaming')

    // Tab from the top of the page to the Anime category link and activate it with Enter.
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

    // Tab from main content to the first article link and activate it. The
    // link is identified by its href rather than its title text, so this
    // stays a keyboard-reachability test instead of a test that one
    // particular article still exists.
    guard = 0
    while (guard < 25) {
      const isArticleLink = await page.evaluate(() => {
        const active = document.activeElement
        return active?.tagName === 'A' && (active.getAttribute('href') ?? '').includes('#/article/')
      })
      if (isArticleLink) break
      await page.keyboard.press('Tab')
      guard += 1
    }
    expect(guard, 'never reached an article link by keyboard').toBeLessThan(25)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/article\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
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
    await expect(page).toHaveURL(/#\/article\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('MOBILE NAV -> DIALOG -> CLOSE, entirely by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/#/anime')

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
    await page.goto('/#/anime')
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
