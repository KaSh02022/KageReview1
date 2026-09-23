import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  shape?: 'text' | 'block' | 'circle'
}

/** A shimmering placeholder block for content that's still loading — respects reduced motion (shimmer becomes a static tone). */
export function Skeleton({ width = '100%', height = '1rem', shape = 'text' }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, styles[`shape-${shape}`]].join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
