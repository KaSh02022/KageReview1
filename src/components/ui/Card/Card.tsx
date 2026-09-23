import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Renders the whole card as a link to this in-app route (still one accessible link, not a div full of nested interactive elements). */
  to?: string
  /** Category accent applied as a left-edge/hover treatment, shared by every content type per docs/04_DESIGN_SYSTEM.md §9. */
  accent?: string
  children: ReactNode
}

/**
 * Composable card shell — one implementation instead of seven near-duplicate
 * card components for articles/characters/events/merchandise/media/releases/
 * categories, per docs/10_IMPLEMENTATION_PLAN.md's card architecture. Compose
 * with CardMedia/CardHeader/CardBody/CardMeta/CardFooter.
 */
export function Card({ to, accent, className, style, children, ...rest }: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(' ')
  const cardStyle = accent ? ({ ...style, '--card-accent': accent } as CSSProperties) : style

  if (to) {
    return (
      <RouterLink to={to} className={`${classes} ${styles.cardLink}`} style={cardStyle} {...rest}>
        {children}
      </RouterLink>
    )
  }

  return (
    <div className={classes} style={cardStyle} {...rest}>
      {children}
    </div>
  )
}

export function CardMedia({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.media, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export function CardBody({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export function CardMeta({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.meta, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

