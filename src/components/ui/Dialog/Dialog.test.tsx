import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Dialog } from './Dialog'

/**
 * Regression coverage for docs/11_DECISION_LOG.md D-012 (Phase 1: the
 * hand-rolled ChatbotLauncher dialog stole focus on initial mount because
 * its focus-management effect fired even while closed) and D-017 (Phase 2:
 * Dialog/Drawer got a real focus trap, which the Phase 1 version never
 * had). Every future dialog in the app is built on this component, so
 * these tests protect the whole app's modal a11y at the root.
 */
function TestHarness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open trigger
      </button>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test Dialog">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Dialog>
    </div>
  )
}

describe('Dialog', () => {
  it('does not render or steal focus while closed, even right after mount', () => {
    render(<TestHarness initialOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(document.body)
  })

  it('moves focus into the panel when opened', async () => {
    render(<TestHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open trigger' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Test Dialog' })).toHaveFocus()
    })
  })

  it('closes on Escape', async () => {
    render(<TestHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open trigger' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('restores focus to the trigger element after closing', async () => {
    render(<TestHarness />)
    const trigger = screen.getByRole('button', { name: 'Open trigger' })
    await userEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('traps Tab focus inside the panel (does not leak to the trigger button behind it)', async () => {
    render(<TestHarness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open trigger' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    const closeButton = screen.getByRole('button', { name: 'Close' })
    const first = screen.getByRole('button', { name: 'First action' })
    const second = screen.getByRole('button', { name: 'Second action' })

    // Tab order inside the dialog: close -> first -> second -> (wraps) close
    closeButton.focus()
    await userEvent.tab()
    expect(first).toHaveFocus()
    await userEvent.tab()
    expect(second).toHaveFocus()
    await userEvent.tab()
    expect(closeButton).toHaveFocus()

    // The outer trigger must never receive focus while the dialog is open.
    expect(screen.getByRole('button', { name: 'Open trigger' })).not.toHaveFocus()
  })

  it('calls onClose when the backdrop is clicked, but not when the panel itself is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Dialog isOpen onClose={onClose} title="Click test">
        <button type="button">Inside</button>
      </Dialog>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Inside' }))
    expect(onClose).not.toHaveBeenCalled()
  })
})
