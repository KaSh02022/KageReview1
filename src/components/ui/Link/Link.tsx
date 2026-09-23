import type { ReactNode } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'
import styles from './Link.module.css'

export interface LinkProps extends RouterLinkProps {
  tone?: 'muted' | 'primary'
  underline?: boolean
  children: ReactNode
}

/**
 * Consistent inline text-link styling — replaces the same 3-line "muted,
 * underline, hover to primary" rule duplicated across
 * Breadcrumb/Footer/related-content links. An external `className` (e.g.
 * ErrorBoundary reusing Button's visual classes to make a link look like a
 * button) is merged in, not replaced.
 */
export function Link({ tone = 'primary', underline = false, className, children, ...rest }: LinkProps) {
  const classes = [styles.link, styles[`tone-${tone}`], underline ? styles.underline : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <RouterLink className={classes} {...rest}>
      {children}
    </RouterLink>
  )
}
