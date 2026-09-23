import { useEffect, useRef } from 'react'
import { useChatbotStore } from '../../stores/chatbotStore'
import styles from './ChatbotLauncher.module.css'

/**
 * Floating chatbot launcher + panel shell, FR-004/FR-032. Phase 1 provides
 * the accessible dialog architecture (focus management, Escape-to-close,
 * aria-modal) and a static welcome message; the rule-based response engine
 * itself is built in Phase 11.
 */
export function ChatbotLauncher() {
  const isOpen = useChatbotStore((state) => state.isOpen)
  const toggle = useChatbotStore((state) => state.toggle)
  const close = useChatbotStore((state) => state.close)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Tracks whether the panel has been opened at least once, so the
  // focus-restore-on-close effect never fires on initial mount and steals
  // focus from the page before the user has interacted with anything.
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true
      panelRef.current?.focus()
    } else if (hasOpenedRef.current) {
      triggerRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.launcher}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
      >
        <span aria-hidden="true">💬</span>
        <span className="visually-hidden">Open FandomVerse assistant</span>
      </button>

      {isOpen && (
        <div
          id="chatbot-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="FandomVerse assistant"
          tabIndex={-1}
          className={styles.panel}
        >
          <div className={styles.panelHeader}>
            <h2>FandomVerse Assistant</h2>
            <button type="button" onClick={close} aria-label="Close assistant">
              ×
            </button>
          </div>
          <p className={styles.panelBody}>
            Hi! This is the Phase 1 chatbot shell — the rule-based FAQ and recommendation engine
            (FR-032–034) is implemented in Phase 11.
          </p>
        </div>
      )}
    </>
  )
}
