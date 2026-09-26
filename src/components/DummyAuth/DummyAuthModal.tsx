import { useId, useState, type FormEvent } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { Dialog } from '../ui/Dialog/Dialog'
import { Button } from '../ui/Button/Button'
import { FormField } from '../ui/Form/FormField'
import { Input } from '../ui/Form/Input'
import formStyles from '../ui/Form/Form.module.css'
import styles from './DummyAuthModal.module.css'

/**
 * Log in / Sign up, FR-045: UI only — submitting flips a local, in-memory
 * "logged in" flag (useUiStore.setDummyLoggedIn) and creates no real,
 * persisted account. That behaviour is unchanged from Phase 1; only the
 * presentation and copy were redesigned (2026-09-26, UI/Copy Cleanup),
 * using the shared Dialog primitive (docs/11_DECISION_LOG.md D-017) for
 * the same focus trap every other dialog in the app already gets.
 *
 * "Remember me" is a real, working checkbox — it just isn't wired to
 * anything, the same as every other field here never was. It is not
 * persisted to storage, matching useUiStore's own documented boundary
 * (isDummyLoggedIn is deliberately in-memory only).
 */
export function DummyAuthModal() {
  const isOpen = useUiStore((state) => state.isDummyAuthOpen)
  const close = useUiStore((state) => state.closeDummyAuth)
  const setDummyLoggedIn = useUiStore((state) => state.setDummyLoggedIn)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const passwordId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDummyLoggedIn(true)
    close()
  }

  const isLogin = mode === 'login'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      title={isLogin ? 'Welcome back' : 'Create your account'}
      description={
        isLogin
          ? 'Sign in to continue your FandomVerse experience.'
          : 'Join FandomVerse and start building your fandom journey.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="Email">
          <Input type="email" autoComplete="off" placeholder="you@example.com" />
        </FormField>

        <div className={formStyles.field}>
          <label htmlFor={passwordId} className={formStyles.label}>
            Password
          </label>
          <div className={styles.passwordRow}>
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              placeholder="Enter your password"
              className={`${formStyles.input} ${styles.passwordInput}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {isLogin && (
          <label className={styles.rememberRow}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Remember me</span>
          </label>
        )}

        <Button type="submit" fullWidth size="large">
          {isLogin ? 'Log in' : 'Create account'}
        </Button>
      </form>
      <button
        type="button"
        className={styles.switchMode}
        onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </Dialog>
  )
}
