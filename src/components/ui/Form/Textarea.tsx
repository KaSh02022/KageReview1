import { forwardRef, type TextareaHTMLAttributes } from 'react'
import styles from './Form.module.css'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea ref={ref} className={[styles.input, styles.textarea, className].filter(Boolean).join(' ')} {...rest} />
    )
  },
)
