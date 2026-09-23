import styles from './Layout.module.css'

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

/** Semantic divider — uses `<hr>` for the unlabeled case so it's announced correctly by assistive tech. */
export function Divider({ orientation = 'horizontal', label }: DividerProps) {
  if (label) {
    return (
      <div className={styles.dividerWithLabel} role="separator" aria-orientation={orientation}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>{label}</span>
        <span className={styles.dividerLine} />
      </div>
    )
  }

  return <hr className={orientation === 'vertical' ? styles.dividerVertical : styles.divider} />
}
