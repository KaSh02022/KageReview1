import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import { useUiStore } from '../../stores/uiStore'

/**
 * The mobile nav toggle button is only visible below the canonical
 * tablet/desktop breakpoint (docs/04_DESIGN_SYSTEM.md §2b), via a CSS
 * media query. jsdom has no layout engine and evaluates at a desktop-ish
 * default viewport, so the toggle is legitimately CSS-hidden in this
 * environment and Testing Library correctly excludes it from queries —
 * that's a jsdom/testing-boundary fact, not a bug. The actual breakpoint
 * behavior is verified with a real viewport in e2e/responsive.spec.ts.
 * Here, the drawer *logic* (store state -> Drawer renders/closes) is
 * exercised directly via the uiStore, independent of the CSS gate.
 */
describe('Header mobile navigation drawer', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false, isDummyAuthOpen: false, isDummyLoggedIn: false })
  })

  it('the drawer is closed by default', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('dialog', { name: 'Browse FandomVerse' })).not.toBeInTheDocument()
  })

  it('opens when uiStore.openMobileNav() runs, and closes via the drawer close button', async () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    act(() => useUiStore.getState().openMobileNav())
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Browse FandomVerse' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Browse FandomVerse' })).not.toBeInTheDocument()
    })
  })

  it('closes the drawer after selecting a category link', async () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    act(() => useUiStore.getState().openMobileNav())
    const drawer = await screen.findByRole('dialog', { name: 'Browse FandomVerse' })

    await userEvent.click(within(drawer).getByRole('link', { name: 'Anime' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Browse FandomVerse' })).not.toBeInTheDocument()
    })
  })
})
