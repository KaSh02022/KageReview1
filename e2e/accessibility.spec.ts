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

    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })
})
