import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
}

interface ChatbotState {
  isOpen: boolean
  messages: ChatMessage[]
  open: () => void
  close: () => void
  toggle: () => void
  pushMessage: (message: ChatMessage) => void
  reset: () => void
}

/**
 * Chatbot conversation is session-only, in-memory state — intentionally
 * NOT persisted to localStorage/sessionStorage (see docs/05_DATA_SCHEMA.md
 * §13 storage boundary table). No SRS requirement asks for chat history to
 * survive a reload; the rule-based engine itself is wired up in Phase 11.
 */
export const useChatbotStore = create<ChatbotState>()((set) => ({
  isOpen: false,
  messages: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  pushMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  reset: () => set({ messages: [] }),
}))
