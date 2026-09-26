import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'
import { getCategoryById } from '../../data'
import { useChatbotStore } from '../../stores/chatbotStore'
import { getWelcome, respond, type AssistantLink } from '../../features/assistant/assistantEngine'
import { IconButton } from '../ui/Button/IconButton'
import { Dialog } from '../ui/Dialog/Dialog'
import styles from './ChatbotLauncher.module.css'

/**
 * Floating assistant launcher + panel, FR-004/FR-032.
 *
 * Built on the shared Dialog primitive (docs/11_DECISION_LOG.md D-017), which
 * supplies a real focus trap, Escape-to-close and focus restoration — the
 * Phase 1 hand-rolled version (D-012) only restored focus, it never trapped
 * Tab inside the panel.
 *
 * The rule engine promised for Phase 11 now exists in
 * `features/assistant/assistantEngine.ts`: pre-scripted, deterministic and
 * entirely local. No network request, no API key, no external service, and no
 * iframe — which also means it works unchanged when WebGL is unavailable,
 * since it shares nothing with the cinematic engine.
 *
 * It knows which world you are standing in by reading the route, the same way
 * the header does, so "who are the characters?" answers for Anime on the Anime
 * hub without the caller having to pass anything in.
 */
export function ChatbotLauncher() {
  const isOpen = useChatbotStore((state) => state.isOpen)
  const toggle = useChatbotStore((state) => state.toggle)
  const close = useChatbotStore((state) => state.close)
  const messages = useChatbotStore((state) => state.messages)
  const pushMessage = useChatbotStore((state) => state.pushMessage)

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeRoute = CATEGORY_ROUTES.find((route) => pathname === `/${route.path}`)
  // Resolved through the dataset rather than used raw, so the id is the
  // canonical CategoryId the engine expects — the same path the header takes.
  const context = { categoryId: activeRoute ? getCategoryById(activeRoute.categoryId)?.id : undefined }

  const [draft, setDraft] = useState('')
  /**
   * `null` means "nothing has been asked yet", so the shortcuts shown are the
   * welcome's. Deriving rather than seeding it in an effect keeps the effect
   * free of setState — one render per exchange instead of a cascade.
   */
  const [replyShortcuts, setReplyShortcuts] = useState<string[] | null>(null)
  /** The most recent reply's quick action (e.g. "Take the Fandom Quiz"), if it had one. */
  const [replyLink, setReplyLink] = useState<AssistantLink | undefined>(undefined)
  const welcome = getWelcome(context)
  const quickReplies = replyShortcuts ?? welcome.quickReplies
  const logRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)
  const nextId = (role: string) => `${role}-${(seq.current += 1)}`

  // The welcome is seeded once per opening, not on every render, and only when
  // the log is empty — reopening mid-conversation should not start over.
  useEffect(() => {
    if (!isOpen || messages.length > 0) return
    pushMessage({ id: nextId('bot'), role: 'bot', text: welcome.text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Keep the newest exchange in view without yanking the page around.
  useEffect(() => {
    if (!isOpen || !logRef.current) return
    logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, isOpen])

  function ask(question: string) {
    const text = question.trim()
    if (!text) return
    pushMessage({ id: nextId('user'), role: 'user', text })
    const reply = respond(text, context)
    pushMessage({ id: nextId('bot'), role: 'bot', text: reply.text })
    setReplyShortcuts(reply.quickReplies)
    setReplyLink(reply.link)
    setDraft('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    ask(draft)
  }

  /** Quick actions actually leave the conversation, so the panel closes once the destination is reached. */
  function followLink() {
    if (!replyLink) return
    navigate(replyLink.path)
    close()
  }

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
        <div className={styles.panel}>
          {/* A live region, so a screen reader hears each answer without the
              focus having to move into the log. */}
          <div
            ref={logRef}
            className={styles.log}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.map((message) => (
              <p
                key={message.id}
                className={message.role === 'bot' ? styles.bot : styles.user}
              >
                <span className={styles.who}>
                  {message.role === 'bot' ? 'Assistant' : 'You'}
                </span>
                {message.text}
              </p>
            ))}
          </div>

          {replyLink && (
            <button type="button" className={styles.linkAction} onClick={followLink}>
              {replyLink.label} →
            </button>
          )}

          {quickReplies.length > 0 && (
            <div className={styles.quick}>
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  className={styles.quickButton}
                  onClick={() => ask(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="assistant-input">
              Ask the FandomVerse assistant
            </label>
            <input
              id="assistant-input"
              className={styles.input}
              type="text"
              autoComplete="off"
              placeholder="Ask about characters, events, merch…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" className={styles.send}>
              Send
            </button>
          </form>

          <p className={styles.note}>
            Answers come from a local script — no account, no network, no AI service.
          </p>
        </div>
      </Dialog>
    </>
  )
}
