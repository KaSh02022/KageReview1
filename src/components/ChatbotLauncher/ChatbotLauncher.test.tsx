import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
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
 *
 * The assistant now reads the route to answer for the world you are standing
 * in, so it is rendered inside a MemoryRouter — the same convention
 * Header.test.tsx uses. Every assertion below is unchanged.
 */
function renderAssistant(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ChatbotLauncher />
    </MemoryRouter>,
  )
}

describe('ChatbotLauncher', () => {
  beforeEach(() => {
    useChatbotStore.setState({ isOpen: false, messages: [] })
  })

  it('does not steal focus on initial mount', () => {
    renderAssistant()
    expect(document.activeElement).toBe(document.body)
  })

  it('opens the assistant panel and moves focus into it when the launcher is clicked', async () => {
    renderAssistant()
    await userEvent.click(screen.getByRole('button', { name: 'Open FandomVerse assistant' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'FandomVerse Assistant' })).toHaveFocus()
    })
  })

  it('closes on Escape and returns focus to the launcher button', async () => {
    renderAssistant()
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

describe('ChatbotLauncher — local rule-based conversation', () => {
  beforeEach(() => {
    useChatbotStore.setState({ isOpen: false, messages: [] })
  })

  async function open(route = '/anime') {
    renderAssistant(route)
    await userEvent.click(screen.getByRole('button', { name: 'Open FandomVerse assistant' }))
    return within(await screen.findByRole('dialog', { name: 'FandomVerse Assistant' }))
  }

  it('greets with a welcome message and starting shortcuts', async () => {
    const panel = await open()
    const log = panel.getByRole('log', { name: 'Conversation' })
    expect(within(log).getByText(/FandomVerse guide/i)).toBeInTheDocument()
    expect(panel.getByRole('button', { name: 'Who are the characters?' })).toBeInTheDocument()
  })

  it('answers a typed question with a deterministic scripted reply', async () => {
    const panel = await open('/anime')
    await userEvent.type(panel.getByLabelText('Ask the FandomVerse assistant'), 'merchandise')
    await userEvent.click(panel.getByRole('button', { name: 'Send' }))

    const log = panel.getByRole('log', { name: 'Conversation' })
    await waitFor(() => {
      expect(within(log).getByText(/demonstration catalogue/i)).toBeInTheDocument()
    })
    // The question is echoed back, so the exchange reads as a conversation.
    expect(within(log).getByText('merchandise')).toBeInTheDocument()
  })

  it('answers for the world the visitor is standing in', async () => {
    const panel = await open('/gaming')
    await userEvent.click(panel.getByRole('button', { name: 'Who are the characters?' }))

    const log = panel.getByRole('log', { name: 'Conversation' })
    await waitFor(() => {
      expect(within(log).getByText(/Gaming/)).toBeInTheDocument()
    })
  })

  it('falls back rather than going silent on an unknown question', async () => {
    const panel = await open()
    await userEvent.type(panel.getByLabelText('Ask the FandomVerse assistant'), 'xyzzy plugh')
    await userEvent.click(panel.getByRole('button', { name: 'Send' }))

    const log = panel.getByRole('log', { name: 'Conversation' })
    await waitFor(() => {
      expect(within(log).getByText(/don't have an answer for that one/i)).toBeInTheDocument()
    })
  })

  it('ignores an empty submission', async () => {
    const panel = await open()
    const log = panel.getByRole('log', { name: 'Conversation' })
    const before = within(log).getAllByText(/./).length
    await userEvent.click(panel.getByRole('button', { name: 'Send' }))
    expect(within(log).getAllByText(/./).length).toBe(before)
  })
})
