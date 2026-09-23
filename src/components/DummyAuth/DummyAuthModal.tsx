import { useState, type FormEvent } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { Dialog } from '../ui/Dialog/Dialog'
import { Button } from '../ui/Button/Button'
import { FormField } from '../ui/Form/FormField'
import { Input } from '../ui/Form/Input'
import styles from './DummyAuthModal.module.css'

/**
 * Dummy Login/Signup, FR-045: UI only, performs no real authentication and
 * creates no real account. Submitting only flips a local, in-memory
 * "logged in (demo)" UI flag. Built on the shared Dialog primitive
 * (docs/11_DECISION_LOG.md D-017) for a real focus trap.
 */
export function DummyAuthModal() {
  const isOpen = useUiStore((state) => state.isDummyAuthOpen)
  const close = useUiStore((state) => state.closeDummyAuth)
  const setDummyLoggedIn = useUiStore((state) => state.setDummyLoggedIn)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDummyLoggedIn(true)
    close()
  }

  return (
    <Dialog isOpen={isOpen} onClose={close} title={`${mode === 'login' ? 'Log in' : 'Sign up'} (demo)`} size="sm">
      <p className={styles.notice}>
        This form is UI-only for demonstration purposes. It does not authenticate you or create a
        real account (SRS FR-045).
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="Email">
          <Input type="email" autoComplete="off" />
        </FormField>
        <FormField label="Password">
          <Input type="password" autoComplete="off" />
        </FormField>
        <Button type="submit" fullWidth>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </Button>
      </form>
      <button
        type="button"
        className={styles.switchMode}
        onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </Dialog>
  )
}
