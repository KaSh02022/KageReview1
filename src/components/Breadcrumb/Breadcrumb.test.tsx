import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

/**
 * Regression test for docs/11_DECISION_LOG.md D-013: in Phase 1, the root
 * layout route had no `handle.breadcrumb`, so `useMatches()` never
 * produced more than 1 crumb for ANY route (Breadcrumb hides itself at
 * `crumbs.length <= 1`) — the breadcrumb silently never rendered anywhere,
 * including on category pages where FR-044 requires it. The fix gave the
 * root route its own `handle: { breadcrumb: 'Home' }`; this test builds a
 * minimal route tree that mirrors that structure so the bug can't return
 * unnoticed.
 */
function buildRouter(initialPath: string) {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <div>
            <Breadcrumb />
            <Outlet />
          </div>
        ),
        handle: { breadcrumb: 'Home' },
        children: [
          { index: true, element: <p>Home page</p> },
          {
            path: 'anime',
            element: <p>Anime hub</p>,
            handle: { breadcrumb: 'Anime' },
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
}

describe('Breadcrumb', () => {
  it('does not render on the home page (only 1 crumb — nothing to trail)', () => {
    render(<RouterProvider router={buildRouter('/')} />)
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
  })

  it('renders "Home / Anime" on a nested category route', () => {
    render(<RouterProvider router={buildRouter('/anime')} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Anime')).toHaveAttribute('aria-current', 'page')
  })
})
