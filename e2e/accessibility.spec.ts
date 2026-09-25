import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * Foundation-level accessibility smoke check for Phase 1 — confirms the
 * shell has no critical/serious violations out of the gate. The full
 * accessibility audit across every page is Phase 12
 * (docs/09_TEST_STRATEGY.md).
 */
test.describe('Accessibility foundation', () => {
  test('home page has no critical or serious axe violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    const seriousOrCritical = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })

  test('skip-to-content link is the first focusable element and works', async ({
    page,
    browserName,
  }) => {
    // WebKit's default behavior excludes <a> links from Tab order unless
    // the OS-level "Full Keyboard Access" preference is enabled — this is
    // a platform default, not an app bug, and affects every site's
    // anchor-based skip link identically in default Safari. Verified
    // manually that the link itself is correctly focusable via
    // element.focus() / real assistive tech; only Playwright's synthetic
    // Tab-key simulation under default WebKit prefs is affected.
    test.skip(browserName === 'webkit', 'WebKit only tabs to links with Full Keyboard Access on')

    await page.goto('/#/anime')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })

  /**
   * Regression test for docs/11_DECISION_LOG.md D-032: activating the
   * skip-to-content link used to rewrite window.location.hash to
   * "#main-content", which HashRouter then read as an attempted route
   * path — silently replacing the current page with the Not Found route.
   * Present since Phase 1; found during Phase 4 E2E testing. Tested on a
   * non-root route specifically, since "/" is a less representative case
   * for HashRouter path-matching than a real nested route like "/anime".
   */
  test('skip-to-content does not corrupt HashRouter state on a non-root route', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit only tabs to links with Full Keyboard Access on')

    await page.goto('/#/anime')
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/#\/anime$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Anime' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page not found' })).not.toBeVisible()
  })
})
