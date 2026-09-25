import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { router } from '../routes/routes'

/**
 * Phase 3 hardening: page titles and route-transition scroll/focus
 * behavior were both real gaps found in the Phase 3 audit (every route
 * showed the same static index.html title; nothing scrolled to top or
 * moved focus after navigating). These tests cover the fixes.
 */
describe('Document title per route', () => {
  beforeEach(async () => {
    await router.navigate('/')
  })

  it('uses the full site title on Home', async () => {
    render(<RouterProvider router={router} />)
    await waitFor(() => {
      expect(document.title).toBe('FandomVerse — Portal for Fandom World')
    })
  })

  it('uses "FandomVerse — <Page>" on other routes, and updates on navigation', async () => {
    render(<RouterProvider router={router} />)

    await router.navigate('/anime')
    await waitFor(() => expect(document.title).toBe('FandomVerse — Anime'))

    await router.navigate('/search')
    await waitFor(() => expect(document.title).toBe('FandomVerse — Search'))

    await router.navigate('/this-does-not-exist')
    await waitFor(() => expect(document.title).toBe('FandomVerse — Page Not Found'))
  })
})

describe('Scroll and focus on route transition', () => {
  beforeEach(async () => {
    await router.navigate('/')
  })

  it('does not steal focus or force a scroll on the initial render', async () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo')
    render(<RouterProvider router={router} />)
    await screen.findByTestId('kage-stage')

    expect(scrollSpy).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(document.body)
    scrollSpy.mockRestore()
  })

  it('scrolls to top and moves focus to main content on a subsequent navigation', async () => {
    render(<RouterProvider router={router} />)
    await screen.findByTestId('kage-stage')

    const scrollSpy = vi.spyOn(window, 'scrollTo')
    await router.navigate('/anime')

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 }))
    })
    await waitFor(() => {
      expect(document.getElementById('main-content')).toHaveFocus()
    })
    scrollSpy.mockRestore()
  })

  it('does not reset scroll/focus for a same-page query change (e.g. search)', async () => {
    await router.navigate('/search')
    render(<RouterProvider router={router} />)
    await screen.findByRole('heading', { name: 'Search' })

    const scrollSpy = vi.spyOn(window, 'scrollTo')
    await router.navigate('/search?q=anime')
    await screen.findByText('Results for "anime"')

    expect(scrollSpy).not.toHaveBeenCalled()
    scrollSpy.mockRestore()
  })
})
