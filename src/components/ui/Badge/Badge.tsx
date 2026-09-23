import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error'
export type BadgeShape = 'rounded' | 'pill'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  shape?: BadgeShape
  children: ReactNode
}

/**
 * Small status/count/category label. Covers both "badge" (content-type,
 * release-status) and "pill" (filter chip) needs from
 * docs/04_DESIGN_SYSTEM.md §6 via the `shape` prop, rather than shipping
 * two near-identical components.
 */
export function Badge({ tone = 'neutral', shape = 'rounded', className, children, ...rest }: BadgeProps) {
  const classes = [styles.badge, styles[`tone-${tone}`], styles[`shape-${shape}`], className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
