import { Fragment } from 'react'
import type { CSSProperties, Ref } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './WordReveal.module.css'

interface WordRevealProps {
  /** The heading text. Split on whitespace; markup is not supported. */
  text: string
  /** Rendered element. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  /** Milliseconds between each word arriving. */
  stagger?: number
  id?: string
}

/**
 * An editorial heading that arrives a word at a time.
 *
 * Each word rides up out of its own overflow-hidden mask, which reads as
 * type being set rather than as a block fading in. The pacing is the point:
 * a heading that arrives at roughly reading speed feels composed, where the
 * same heading fading in all at once feels like a loading state.
 *
 * Accessibility: the real phrase is carried by `aria-label` on the heading
 * and every visual word is `aria-hidden`, so a screen reader announces one
 * clean sentence instead of a stream of disconnected words. Under reduced
 * motion the whole mechanism is skipped and the text renders plainly —
 * there is then no `aria-label` to go stale, because the text node itself
 * is the accessible name.
 */
export function WordReveal({
  text,
  as = 'h2',
  className,
  stagger = 72,
  id,
}: WordRevealProps) {
  // Narrowed to one concrete tag: TypeScript cannot resolve the props of a
  // union of intrinsic elements, and every member of this union takes the
  // same heading props anyway.
  const Tag = as as 'h2'
  const prefersReducedMotion = usePrefersReducedMotion()
  const { ref, isRevealed } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  if (prefersReducedMotion) {
    return (
      <Tag id={id} className={className}>
        {text}
      </Tag>
    )
  }

  const words = text.split(/\s+/).filter(Boolean)

  return (
    <Tag
      id={id}
      ref={ref as Ref<HTMLHeadingElement>}
      className={[className, styles.heading, isRevealed ? styles.revealed : '']
        .filter(Boolean)
        .join(' ')}
      aria-label={text}
    >
      {words.map((word, index) => (
        // Words repeat within a heading, so the index is part of the key by
        // necessity; the list is static for the life of the heading.
        <Fragment key={`${word}-${index}`}>
          <span className={styles.mask} aria-hidden="true">
            <span
              className={styles.word}
              style={{ '--word-delay': `${index * stagger}ms` } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {/* The separator sits BETWEEN masks, not inside one: a mask is
              `overflow: hidden`, which swallowed the trailing space and
              rendered "TV Shows" as "TVShows". */}
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
