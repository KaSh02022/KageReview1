import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import styles from './Layout.module.css'

export type SpaceToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  direction?: 'row' | 'column'
  gap?: SpaceToken
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
  wrap?: boolean
  children: ReactNode
}

/** A flex layout primitive so component CSS stops hand-rolling `display:flex; gap:...` repeatedly. */
export function Stack({
  as: Tag = 'div',
  direction = 'column',
  gap = 'md',
  align,
  justify,
  wrap = false,
  className,
  style,
  children,
  ...rest
}: StackProps) {
  const classes = [styles.stack, wrap ? styles.stackWrap : '', className].filter(Boolean).join(' ')
  return createElement(
    Tag,
    {
      ...rest,
      className: classes,
      style: {
        flexDirection: direction,
        gap: `var(--space-${gap})`,
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
        justifyContent:
          justify === 'start'
            ? 'flex-start'
            : justify === 'end'
              ? 'flex-end'
              : justify === 'between'
                ? 'space-between'
                : justify,
        ...style,
      },
    },
    children,
  )
}
