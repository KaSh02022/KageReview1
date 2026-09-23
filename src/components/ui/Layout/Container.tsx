import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Layout.module.css'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  narrow?: boolean
  children: ReactNode
}

/**
 * The one "centered, max-width, horizontal gutter" wrapper — replaces the
 * repeated `max-width: var(--content-max-width); margin: 0 auto; padding:
 * 0 var(--space-lg)` pattern found independently in Header, Footer, and
 * the category nav during the Phase 2 audit.
 */
export function Container({ as: Tag = 'div', narrow = false, className, children, ...rest }: ContainerProps) {
  const classes = [styles.container, narrow ? styles.containerNarrow : '', className]
    .filter(Boolean)
    .join(' ')
  // createElement (not JSX) sidesteps a known TS limitation where a
  // generic `as?: ElementType` prop makes JSX infer `children`/rest props
  // as `never` for some branches of the ElementType union.
  return createElement(Tag, { ...rest, className: classes }, children)
}
