import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FandomCoreFallback } from './FandomCoreFallback'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'

describe('FandomCoreFallback (2D Fandom Core — no-WebGL / reduced-motion / loading state)', () => {
  it('renders without any WebGL/canvas dependency', () => {
    render(
      <MemoryRouter>
        <FandomCoreFallback hoveredCategoryId={null} onHoverChange={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('fandom-core-fallback')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('still exposes all seven category links — the fallback must never lose navigation (Phase 4 §10)', () => {
    render(
      <MemoryRouter>
        <FandomCoreFallback hoveredCategoryId={null} onHoverChange={vi.fn()} />
      </MemoryRouter>,
    )
    for (const node of FANDOM_CORE_NODES) {
      expect(screen.getByRole('link', { name: `Explore ${node.label}` })).toBeInTheDocument()
    }
  })
})
