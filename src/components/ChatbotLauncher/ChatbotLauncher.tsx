import { useChatbotStore } from '../../stores/chatbotStore'
import { IconButton } from '../ui/Button/IconButton'
import { Dialog } from '../ui/Dialog/Dialog'
import styles from './ChatbotLauncher.module.css'

/**
 * Floating chatbot launcher + panel shell, FR-004/FR-032. Built on the
 * shared Dialog primitive (docs/11_DECISION_LOG.md D-017), which supplies
 * a real focus trap, Escape-to-close, and focus restoration — the Phase 1
 * hand-rolled version (D-012) only restored focus, it never trapped Tab
 * inside the panel while open. Phase 1 provided the static welcome
 * message; the rule-based response engine itself is built in Phase 11.
 */
export function ChatbotLauncher() {
  const isOpen = useChatbotStore((state) => state.isOpen)
  const toggle = useChatbotStore((state) => state.toggle)
  const close = useChatbotStore((state) => state.close)

  return (
    <>
      <IconButton
        label="Open FandomVerse assistant"
        icon="💬"
        variant="primary"
        size="large"
        className={styles.launcher}
        style={{ borderRadius: 'var(--radius-pill)' }}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      />

      <Dialog isOpen={isOpen} onClose={close} title="FandomVerse Assistant" size="sm">
        <p className={styles.panelBody}>
          Hi! The assistant isn’t answering questions yet — this is the panel it will live in. The
          FAQ and recommendation engine is still being built.
        </p>
      </Dialog>
    </>
  )
}
