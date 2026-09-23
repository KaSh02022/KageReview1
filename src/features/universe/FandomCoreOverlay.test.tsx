import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FandomCoreOverlay } from './FandomCoreOverlay'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'

function renderOverlay(hoveredCategoryId: string | null = null, onHoverChange = vi.fn()) {
  return render(
    <MemoryRouter>
      <FandomCoreOverlay hoveredCategoryId={hoveredCategoryId} onHoverChange={onHoverChange} />
    </MemoryRouter>,
  )
}

describe('FandomCoreOverlay (the Fandom Core\'s accessible interaction surface)', () => {
  it('renders all seven category nodes as real, labeled links', () => {
    renderOverlay()
    for (const node of FANDOM_CORE_NODES) {
      const link = screen.getByRole('link', { name: `Explore ${node.label}` })
      expect(link).toHaveAttribute('href', `/${node.path}`)
    }
  })

  it('is fully keyboard-reachable (every node is a real, tabbable link)', async () => {
    renderOverlay()
    await userEvent.tab()
    const firstLink = screen.getByRole('link', { name: `Explore ${FANDOM_CORE_NODES[0].label}` })
    expect(firstLink).toHaveFocus()
  })

  it('reports hover state via onHoverChange on mouse enter/leave', async () => {
    const onHoverChange = vi.fn()
    renderOverlay(null, onHoverChange)
    const link = screen.getByRole('link', { name: `Explore ${FANDOM_CORE_NODES[0].label}` })

    await userEvent.hover(link)
    expect(onHoverChange).toHaveBeenCalledWith(FANDOM_CORE_NODES[0].categoryId)

    await userEvent.unhover(link)
    expect(onHoverChange).toHaveBeenCalledWith(null)
  })

  it('reports hover state via onHoverChange on keyboard focus/blur, not just mouse (selected/hover state must be keyboard-reachable too)', async () => {
    const onHoverChange = vi.fn()
    renderOverlay(null, onHoverChange)
    const link = screen.getByRole('link', { name: `Explore ${FANDOM_CORE_NODES[0].label}` })

    link.focus()
    expect(onHoverChange).toHaveBeenCalledWith(FANDOM_CORE_NODES[0].categoryId)

    link.blur()
    expect(onHoverChange).toHaveBeenCalledWith(null)
  })
})
