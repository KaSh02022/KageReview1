import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Module-level counter so nested/sequential dialogs don't fight over the
// #root aria-hidden attribute (e.g. dialog B closing must not un-hide the
// background while dialog A is still open).
let openDialogCount = 0

function hideAppRootFromAssistiveTech() {
  openDialogCount += 1
  document.getElementById('root')?.setAttribute('aria-hidden', 'true')
}

function restoreAppRootIfNoDialogsOpen() {
  openDialogCount = Math.max(0, openDialogCount - 1)
  if (openDialogCount === 0) {
    document.getElementById('root')?.removeAttribute('aria-hidden')
  }
}

/**
 * Full dialog-pattern a11y behavior, shared by every overlay primitive
 * (Dialog, Drawer) so no consumer has to reimplement it — and so the
 * Phase 1 focus-stealing regression (docs/11_DECISION_LOG.md D-012) can't
 * reappear in a different component.
 *
 * - Moves focus into the dialog when it opens (never on initial mount of
 *   a closed dialog — only on the open transition).
 * - Traps Tab/Shift+Tab within the dialog while open.
 * - Closes on Escape.
 * - Restores focus to the trigger element when the dialog closes, but
 *   ONLY if it was actually open before (guards the exact Phase 1 bug).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null
      wasOpenRef.current = true
      containerRef.current?.focus()
      hideAppRootFromAssistiveTech()
      return () => restoreAppRootIfNoDialogsOpen()
    } else if (wasOpenRef.current) {
      triggerElementRef.current?.focus()
      triggerElementRef.current = null
    }
  }, [isOpen, containerRef])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const container = containerRef.current
      if (!container) return

      // Uses computed style rather than `offsetParent` to detect hidden
      // elements — `offsetParent` requires a real layout engine and is
      // always null in jsdom, which would silently empty this list under
      // Vitest even though the elements are genuinely visible.
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => {
        const computed = window.getComputedStyle(el)
        return computed.display !== 'none' && computed.visibility !== 'hidden'
      })
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !container.contains(active)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, containerRef])
}
