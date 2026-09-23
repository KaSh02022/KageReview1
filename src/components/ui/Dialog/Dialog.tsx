import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { IconButton } from '../Button/IconButton'
import styles from './Dialog.module.css'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  /** Hides the visible title bar text while still providing it as the accessible name. */
  hideTitleVisually?: boolean
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  /** Closing via a backdrop click is opt-out, not opt-in, since it's the expected pattern for every dialog in this app. */
  closeOnBackdropClick?: boolean
}

/**
 * Shared accessible modal primitive — focus trap, initial focus, Escape to
 * close, focus restoration, background hidden from assistive tech
 * (useFocusTrap), rendered via a portal so it always stacks above the app
 * shell regardless of where it's mounted. Both ChatbotLauncher and
 * DummyAuthModal are built on this so the Phase 1 focus-stealing
 * regression (D-012) can't reappear in a third, hand-rolled dialog.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  hideTitleVisually = false,
  description,
  size = 'md',
  children,
  closeOnBackdropClick = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useFocusTrap(panelRef, isOpen, onClose)

  if (!isOpen) return null

  return createPortal(
    // The backdrop is a mouse-only dismiss affordance — keyboard users
    // already have Escape (wired via useFocusTrap), so it's marked
    // role="presentation" rather than given a redundant keyboard handler.
    <div
      className={styles.overlay}
      role="presentation"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      {/*
        The panel's onClick is not new interactivity — it only guards
        against a click on the panel bubbling to the backdrop's onClose
        handler above. The dialog is reachable/operable entirely via the
        focus trap + Escape (useFocusTrap), so no keyboard handler is
        needed here.
      */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`${styles.panel} ${styles[`size-${size}`]}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={hideTitleVisually ? 'visually-hidden' : styles.title}>
            {title}
          </h2>
          <IconButton label="Close" size="small" variant="ghost" onClick={onClose}>
            ×
          </IconButton>
        </div>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
