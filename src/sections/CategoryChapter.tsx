import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Category, Character } from '../types/content'
import { CATEGORY_HERO_ART_WIDE, portraitFor } from '../data/landingAssets'
import { CHAPTER_ACCENT_RGB } from '../features/landing/chapterAccents'
import { WordReveal } from '../features/landing/WordReveal'
import { Reveal } from '../components/Reveal/Reveal'
import styles from './CategoryChapter.module.css'

interface CategoryChapterProps {
  category: Category
  /** The one lead who represents this world on the landing page. */
  lead: Character | undefined
  /** Chapter number as shown, e.g. "03". */
  number: string
  /** Index in the chapter progress space — drives this chapter's parallax. */
  chapterIndex: number
  /** Route path for this category's hub, without a leading slash. */
  path: string
  registerRef: (element: HTMLElement | null) => void
  /** True for the chapter currently being read. */
  isActive: boolean
}

/**
 * One category, composed as a cinematic shot.
 *
 * The section is taller than the viewport and its stage is `sticky`, so the
 * shot arrives, **holds while you travel through it**, and then releases to
 * the next one. That is what makes the page read as continuous movement
 * rather than as a stack of panels: nothing cuts, the camera simply stops
 * pushing for a while.
 *
 * All parallax comes from one inherited custom property. `--chapter-progress`
 * is written to an ancestor once per animation frame by `useChapterProgress`;
 * each chapter subtracts its own index from it to get a local value that is
 * `0` when the chapter is centred, negative before and positive after. Every
 * layer then multiplies that local value by its own depth. No per-layer
 * JavaScript, no scroll listener per chapter, and the whole field stays in
 * step because it is all derived from the same number.
 */
export function CategoryChapter({
  category,
  lead,
  number,
  chapterIndex,
  path,
  registerRef,
  isActive,
}: CategoryChapterProps) {
  const accentRgb = CHAPTER_ACCENT_RGB[category.id]

  return (
    <section
      ref={registerRef}
      // Focusable so the chapter rail can move focus here, but not in the
      // tab order — the links inside are the real stops.
      tabIndex={-1}
      className={styles.chapter}
      aria-labelledby={`chapter-${category.id}-heading`}
      data-state={isActive ? 'active' : 'passing'}
      style={
        {
          '--chapter-i': chapterIndex,
          '--accent-rgb': accentRgb,
        } as CSSProperties
      }
    >
      <div className={styles.stage}>
        {/* --- layer 1: the world plate, furthest back --- */}
        <div className={styles.plate} aria-hidden="true">
          <img
            className={styles.plateImage}
            src={CATEGORY_HERO_ART_WIDE[category.id]}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* --- layer 2: depth haze, pushing the plate back --- */}
        <div className={styles.haze} aria-hidden="true" />

        {/* --- layer 3: the lead, standing in the world --- */}
        {lead ? (
          <div className={styles.figure} aria-hidden="true">
            <img
              className={styles.figureImage}
              src={portraitFor(lead.id, lead.image.src)}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        {/* --- layer 4: foreground vignette, nearest the viewer --- */}
        <div className={styles.foreground} aria-hidden="true" />

        {/* Fixed edges: dissolve the top and bottom of the shot into the
            page so chapters bleed into one another instead of cutting. */}
        <div className={styles.edges} aria-hidden="true" />

        {/* --- layer 5: type --- */}
        <div className={styles.content}>
          <Reveal className={styles.marker}>
            <span className={styles.number}>{number}</span>
            <span className={styles.rule} aria-hidden="true" />
            <span className={styles.franchise}>{category.franchise}</span>
          </Reveal>

          <WordReveal
            id={`chapter-${category.id}-heading`}
            className={styles.title}
            text={category.name}
          />

          <Reveal delay={90}>
            <p className={styles.tagline}>{category.tagline}</p>
          </Reveal>

          <Reveal delay={160}>
            <p className={styles.description}>{category.description}</p>
          </Reveal>

          {lead ? (
            <Reveal delay={230}>
              <p className={styles.lead}>
                <span className={styles.leadLabel}>Lead</span>
                <span className={styles.leadName}>{lead.name}</span>
                <span className={styles.leadRole}>{lead.role}</span>
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={300}>
            {/* Named for the franchise, not "Explore {Category}" — the
                Fandom Core already owns a link by that name for every
                category, and two links sharing a name and a destination
                are indistinguishable in a screen reader's link list. */}
            <Link to={`/${path}`} className={styles.cta}>
              <span>Enter {category.franchise}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
