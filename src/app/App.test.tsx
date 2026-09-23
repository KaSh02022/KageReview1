import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { router } from '../routes/routes'

describe('App routing (Phase 1 foundation)', () => {
  beforeEach(async () => {
    localStorage.clear()
    sessionStorage.clear()
    await router.navigate('/')
  })

  it('boots and renders the home page at the root route', async () => {
    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { name: /explore fandoms/i })).toBeInTheDocument()
  })

  it('navigates to every primary route and renders a real page (not a blank screen)', async () => {
    render(<RouterProvider router={router} />)

    const routesToCheck: Array<[string, RegExp]> = [
      ['/anime', /^anime$/i],
      ['/gaming', /^gaming$/i],
      ['/movies', /^movies$/i],
      ['/tv-shows', /^tv shows$/i],
      ['/k-pop', /^k-pop$/i],
      ['/comics', /^comics$/i],
      ['/manga', /^manga$/i],
      ['/category/anime', /^anime$/i],
      ['/search', /^search$/i],
      ['/trailers', /^trailers$/i],
      ['/events', /^events$/i],
      ['/releases', /upcoming releases/i],
      ['/merchandise', /^merchandise$/i],
      ['/cart', /your cart/i],
      ['/bookmarks', /^bookmarks$/i],
      ['/contact', /contact us/i],
      ['/about', /about fandomverse/i],
      ['/article/article-anime-sample-01', /sample article/i],
      ['/character/character-anime-sample-01', /sample character one/i],
      ['/event/event-anime-sample-01', /sample event/i],
      ['/product/merch-anime-sample-01', /sample t-shirt/i],
    ]

    for (const [path, expectedHeading] of routesToCheck) {
      await router.navigate(path)
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: expectedHeading })).toBeInTheDocument()
      })
    }
  })

  it('renders the Not Found page for an unknown route', async () => {
    render(<RouterProvider router={router} />)
    await router.navigate('/this-route-does-not-exist')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    })
  })

  it('supports browser back/forward navigation between routes', async () => {
    render(<RouterProvider router={router} />)

    await router.navigate('/anime')
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /^anime$/i })).toBeInTheDocument()
    })

    await router.navigate('/gaming')
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /^gaming$/i })).toBeInTheDocument()
    })

    window.history.back()
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /^anime$/i })).toBeInTheDocument()
    })

    window.history.forward()
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /^gaming$/i })).toBeInTheDocument()
    })
  })
})
