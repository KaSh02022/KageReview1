import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useUiStore } from '../../stores/uiStore'
import styles from './DummyAuthModal.module.css'

/**
 * Dummy Login/Signup, FR-045: UI only, performs no real authentication and
 * creates no real account. Submitting only flips a local, in-memory
 * "logged in (demo)" UI flag.
 */
export function DummyAuthModal() {
  const isOpen = useUiStore((state) => state.isDummyAuthOpen)
  const close = useUiStore((state) => state.closeDummyAuth)
  const setDummyLoggedIn = useUiStore((state) => state.setDummyLoggedIn)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) panelRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  if (!isOpen) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDummyLoggedIn(true)
    close()
  }

  return (
    <div className={styles.overlay}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dummy-auth-title"
        tabIndex={-1}
        className={styles.panel}
      >
        <div className={styles.header}>
          <h2 id="dummy-auth-title">{mode === 'login' ? 'Log in' : 'Sign up'} (demo)</h2>
          <button type="button" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <p className={styles.notice}>
          This form is UI-only for demonstration purposes. It does not authenticate you or create
          a real account (SRS FR-045).
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="dummy-auth-email">Email</label>
          <input id="dummy-auth-email" type="email" autoComplete="off" />
          <label htmlFor="dummy-auth-password">Password</label>
          <input id="dummy-auth-password" type="password" autoComplete="off" />
          <button type="submit" className={styles.submit}>
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <button
          type="button"
          className={styles.switchMode}
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
