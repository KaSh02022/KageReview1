import { test, expect } from '@playwright/test'

/**
 * Phase 3 §6 required verification: confirms, via real DOM inspection (not
 * just reading the source), that Dialog/Drawer's background-inertness
 * strategy is actually correct. Both primitives portal to `document.body`
 * (a *sibling* of `#root`, not a descendant), and `useFocusTrap` sets
 * `aria-hidden="true"` on `#root` specifically while open — so the
 * background app is correctly hidden from assistive tech while the
 * portaled dialog itself is never inside that hidden subtree and stays
 * fully exposed to the accessibility tree. If either primitive were ever
 * changed to render inside `#root` instead of a portal, this test would
 * catch the dialog becoming accidentally `aria-hidden` along with the
 * background — a real, non-obvious defect class for modal dialogs.
 */
test.describe('Dialog/Drawer background-inertness architecture', () => {
  test('Dialog: portals outside #root, and #root aria-hidden does not hide the dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open FandomVerse assistant' }).click()
    await expect(page.getByRole('dialog', { name: 'FandomVerse Assistant' })).toBeVisible()

    const info = await page.evaluate(() => {
      const root = document.getElementById('root')
      const dialog = document.querySelector('[role="dialog"]')
      return {
        rootAriaHidden: root?.getAttribute('aria-hidden'),
        dialogIsInsideRoot: root ? root.contains(dialog) : null,
        dialogHasHiddenAncestor: dialog ? dialog.closest('[aria-hidden="true"]') !== null : null,
      }
    })

    expect(info.rootAriaHidden).toBe('true')
    expect(info.dialogIsInsideRoot).toBe(false)
    expect(info.dialogHasHiddenAncestor).toBe(false)
  })

  test('Drawer: same portal/aria-hidden architecture as Dialog', async ({ page }) => {
    // The toggle only exists below the canonical tablet/desktop boundary
    // (docs/04_DESIGN_SYSTEM.md §2a) — force a mobile viewport so it's
    // actually visible/clickable, independent of whatever viewport this
    // browser project defaults to.
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Browse FandomVerse' })).toBeVisible()

    const info = await page.evaluate(() => {
      const root = document.getElementById('root')
      const drawer = document.querySelector('[role="dialog"]')
      return {
        rootAriaHidden: root?.getAttribute('aria-hidden'),
        drawerIsInsideRoot: root ? root.contains(drawer) : null,
        drawerHasHiddenAncestor: drawer ? drawer.closest('[aria-hidden="true"]') !== null : null,
      }
    })

    expect(info.rootAriaHidden).toBe('true')
    expect(info.drawerIsInsideRoot).toBe(false)
    expect(info.drawerHasHiddenAncestor).toBe(false)
  })

  test('#root aria-hidden is removed again after the dialog closes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open FandomVerse assistant' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()

    const rootAriaHidden = await page.evaluate(() => document.getElementById('root')?.getAttribute('aria-hidden'))
    expect(rootAriaHidden).toBeNull()
  })
})
