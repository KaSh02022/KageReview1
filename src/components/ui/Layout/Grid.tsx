import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Layout.module.css'

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Minimum card width before the fluid grid adds another column — responsive via CSS, no breakpoint JS. */
  minItemWidth?: number
  gap?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

/**
 * Fluid responsive grid (`repeat(auto-fill, minmax(...))`) — the pattern
 * already used ad hoc in HomePage's category grid, promoted to a shared
 * primitive so every future card grid (characters, events, merchandise,
 * galleries) is responsive by construction instead of needing its own
 * breakpoint rules.
 */
export function Grid({
  as: Tag = 'div',
  minItemWidth = 220,
  gap = 'md',
  className,
  style,
  children,
  ...rest
}: GridProps) {
  const classes = [styles.grid, className].filter(Boolean).join(' ')
  return createElement(
    Tag,
    {
      ...rest,
      className: classes,
      style: {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
        gap: `var(--space-${gap})`,
        ...style,
      },
    },
    children,
  )
}
