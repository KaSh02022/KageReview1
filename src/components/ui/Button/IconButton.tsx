import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'
import iconStyles from './IconButton.module.css'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required — every icon-only control must have an accessible name (docs/04_DESIGN_SYSTEM.md §11). */
  label: string
  icon?: ReactNode
  children?: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'small' | 'medium' | 'large'
}

/**
 * Icon-only button built on the same visual system as Button. `label` is
 * mandatory and always becomes the accessible name (visible text is
 * hidden), preventing the class of bug where an icon button ships with no
 * name at all.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, children, variant = 'ghost', size = 'medium', className, ...rest },
  ref,
) {
  const classes = [
    styles.button,
    styles[`variant-${variant}`],
    iconStyles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classes} aria-label={label} {...rest}>
      <span aria-hidden="true">{icon ?? children}</span>
    </button>
  )
})
