import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './Reveal.module.css'

interface RevealProps {
  children: ReactNode
  /** Rendered element. Sections should pass `as="section"` to keep semantics. */
  as?: ElementType
  /** Stagger offset in ms, for revealing siblings in sequence. */
  delay?: number
  /**
   * Reveal on mount instead of on scroll. For anything in the opening
   * screen: an IntersectionObserver with a negative `rootMargin` can leave
   * an element that is already on screen permanently unrevealed when the
   * viewport is short, which is exactly what happened to the intro's
   * statement at 1024x768.
   */
  immediate?: boolean
  className?: string
  id?: string
  'aria-labelledby'?: string
}

/**
 * Scroll-triggered reveal wrapper: fade + small upward translate.
 *
 * Only `opacity` and `transform` animate, so the whole effect stays on the
 * compositor and never triggers layout. Under `prefers-reduced-motion` the
 * hook starts revealed and the stylesheet drops the transition entirely,
 * so content is simply present.
 */
export function Reveal({
  children,
  as = 'div',
  delay = 0,
  className,
  immediate = false,
  ...rest
}: RevealProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>()
  const revealed = immediate || isRevealed

  return createElement(
    as,
    {
      ...rest,
      ref,
      className: [styles.reveal, revealed ? styles.revealed : '', className].filter(Boolean).join(' '),
      style: delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined,
    },
    children,
  )
}
