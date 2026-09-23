import { useId, type ReactElement, cloneElement } from 'react'
import styles from './Form.module.css'

export interface FormFieldProps {
  label: string
  helpText?: string
  error?: string
  required?: boolean
  /** The Input/Select element — id/aria-describedby/aria-invalid are wired in automatically. */
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>
}

/**
 * Label + control + help/error text, wired together with the right ids and
 * `aria-describedby`/`aria-invalid` so every form control in the app gets
 * this for free instead of each feature hand-wiring its own label
 * association (a common, easy-to-miss a11y gap).
 */
export function FormField({ label, helpText, error, required, children }: FormFieldProps) {
  const inputId = useId()
  const helpId = useId()
  const errorId = useId()

  const describedBy = [helpText ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id: inputId,
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error),
  })

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && (
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        )}
      </label>
      {control}
      {helpText && !error && (
        <p id={helpId} className={styles.helpText}>
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
