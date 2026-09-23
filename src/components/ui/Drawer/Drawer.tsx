import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { IconButton } from '../Button/IconButton'
import styles from './Drawer.module.css'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: ReactNode
}

/**
 * Side-sliding panel sharing the same focus-trap/Escape/restore contract
 * as Dialog (useFocusTrap) — used for the mobile navigation menu (and any
 * future filter/cart drawer) instead of Header hand-rolling its own
 * show/hide + accessibility logic.
 */
export function Drawer({ isOpen, onClose, title, side = 'left', children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useFocusTrap(panelRef, isOpen, onClose)

  if (!isOpen) return null

  return createPortal(
    // The backdrop is a mouse-only dismiss affordance — keyboard users
    // already have Escape (wired via useFocusTrap).
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      {/* The panel's onClick only guards against a click bubbling to the backdrop; Escape (useFocusTrap) covers keyboard dismissal. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`${styles.panel} ${side === 'right' ? styles.right : styles.left}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton label="Close menu" size="small" variant="ghost" onClick={onClose}>
            ×
          </IconButton>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
