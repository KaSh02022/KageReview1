import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatbotLauncher } from './ChatbotLauncher'
import { useChatbotStore } from '../../stores/chatbotStore'

/**
 * Regression test for docs/11_DECISION_LOG.md D-012: in Phase 1, this
 * component's focus-management effect fired on initial mount (isOpen
 * starts false) and called `.focus()` on the trigger button, silently
 * breaking the page's Tab order (Tab landed on the chatbot button instead
 * of the skip link). Phase 2 rebuilt it on the shared Dialog primitive
 * (useFocusTrap), which guards against this explicitly — this test makes
 * sure it stays fixed.
 */
describe('ChatbotLauncher', () => {
  beforeEach(() => {
    useChatbotStore.setState({ isOpen: false, messages: [] })
  })

  it('does not steal focus on initial mount', () => {
    render(<ChatbotLauncher />)
    expect(document.activeElement).toBe(document.body)
  })

  it('opens the assistant panel and moves focus into it when the launcher is clicked', async () => {
    render(<ChatbotLauncher />)
    await userEvent.click(screen.getByRole('button', { name: 'Open FandomVerse assistant' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'FandomVerse Assistant' })).toHaveFocus()
    })
  })

  it('closes on Escape and returns focus to the launcher button', async () => {
    render(<ChatbotLauncher />)
    const launcher = screen.getByRole('button', { name: 'Open FandomVerse assistant' })
    await userEvent.click(launcher)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(launcher).toHaveFocus()
    })
  })
})
