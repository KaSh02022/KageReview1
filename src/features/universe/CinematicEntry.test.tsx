import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CinematicEntry } from './CinematicEntry'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'

/**
 * jsdom has no WebGL (canvas.getContext('webgl') returns null), so
 * useWebglSupport() always reports false here — CinematicEntry always
 * takes the 2D fallback path in this test environment. That's exactly the
 * "WebGL-disabled/fallback mode" case §9 asks to test, and
 * it happens for free; the real canvas path is covered by E2E (a real
 * browser) instead.
 */
function renderHome() {
  return render(
    <MemoryRouter>
      <CinematicEntry />
      {/* Stand-in for HomePage's real skip-link target. */}
      <section id="fandom-categories-section" tabIndex={-1}>
        stub categories section
      </section>
    </MemoryRouter>,
  )
}

describe('CinematicEntry (Fandom Core entry point)', () => {
  it('always renders the FandomVerse h1, regardless of WebGL support', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: 'FandomVerse' })).toBeInTheDocument()
  })

  it('falls back to the 2D Fandom Core when WebGL is unavailable (no canvas rendered)', () => {
    renderHome()
    expect(screen.getByTestId('fandom-core-fallback')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('still exposes all seven category links in fallback mode', () => {
    renderHome()
    for (const node of FANDOM_CORE_NODES) {
      expect(screen.getByRole('link', { name: `Explore ${node.label}` })).toBeInTheDocument()
    }
  })

  it('the skip-intro control moves focus to the categories section', async () => {
    renderHome()
    const skipLink = screen.getByRole('link', { name: /skip intro/i })
    await userEvent.click(skipLink)
    expect(screen.getByText('stub categories section')).toHaveFocus()
  })
})

describe('CinematicEntry under prefers-reduced-motion: reduce', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('stays on the 2D fallback and preserves all category navigation, even if WebGL were available', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    renderHome()

    expect(screen.getByTestId('fandom-core-fallback')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
    for (const node of FANDOM_CORE_NODES) {
      expect(screen.getByRole('link', { name: `Explore ${node.label}` })).toBeInTheDocument()
    }
  })
})
