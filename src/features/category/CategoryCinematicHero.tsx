import type { CSSProperties } from 'react'
import type { Category, Character } from '../../types/content'
import { CATEGORY_HERO_ART_WIDE, portraitFor } from '../../data/landingAssets'
import { CHAPTER_ACCENT_RGB } from '../landing/chapterAccents'
import { AtmosphereCanvas } from '../landing/AtmosphereCanvas'
import { WordReveal } from '../landing/WordReveal'
import { Reveal } from '../../components/Reveal/Reveal'
import { useSceneProgress } from '../cinematic/useSceneProgress'
import styles from './CategoryCinematicHero.module.css'

interface CategoryCinematicHeroProps {
  category: Category
  /** The world's representative lead, or undefined if it has no approved art. */
  lead: Character | undefined
  /** Scrolls the reader into the hub content below. */
  onEnter: () => void
}

/**
 * A category's cinematic opening.
 *
 * Shares the landing's runtime — damped scroll progress, the atmosphere
 * canvas, the word-level heading reveal and the reveal stagger — but not its
 * scene. The Kage temple, its torii, its moon, its maple foreground and the
 * 3D wordmark all belong to `/`; carrying them onto a category page would put
 * a Kyoto shrine behind a tactical shooter and, worse, would drop a fixed
 * foreground plane over this page's own copy.
 *
 * So the composition here is the category's own:
 *
 *   background plate  z 0   the world, pushed back
 *   atmosphere        z 1   drifting motes in the category accent
 *   character         z 2   the lead, feathered into the scene
 *   content           z 3   type and the call to action, above everything
 *
 * Every layer derives its parallax from one inherited `--scene-progress`,
 * written by `useSceneProgress` once per animation frame.
 */
export function CategoryCinematicHero({ category, lead, onEnter }: CategoryCinematicHeroProps) {
  const { sceneRef, progressRef } = useSceneProgress()
  // Deterministic from the category, so no ref or generated id is needed.
  const headingId = `cinematic-${category.id}-heading`
  const accentRgb = CHAPTER_ACCENT_RGB[category.id]

  return (
    <header
      ref={sceneRef as React.RefObject<HTMLElement>}
      className={styles.scene}
      style={{ '--accent-rgb': accentRgb } as CSSProperties}
      aria-labelledby={headingId}
    >
      <div className={styles.plate} aria-hidden="true">
        <img
          className={styles.plateImage}
          src={CATEGORY_HERO_ART_WIDE[category.id]}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className={styles.haze} aria-hidden="true" />
      <AtmosphereCanvas progressRef={progressRef} accent={accentRgb} />

      {lead ? (
        <div className={styles.figure} aria-hidden="true">
          <img
            className={styles.figureImage}
            src={portraitFor(lead.id, lead.image.src)}
            alt=""
            decoding="async"
          />
        </div>
      ) : null}

      {/* Feathers the bottom of the scene into the hub content below, so the
          two meet on a dissolve rather than a hard horizontal line. */}
      <div className={styles.edge} aria-hidden="true" />

      <div className={styles.content}>
        <Reveal immediate className={styles.marker}>
          <span className={styles.rule} aria-hidden="true" />
          <span>{category.franchise}</span>
        </Reveal>

        {/* The page's only h1, and the accessible name every hub test reads. */}
        <WordReveal as="h1" id={headingId} className={styles.title} text={category.name} />

        <Reveal immediate delay={120}>
          <p className={styles.tagline}>{category.tagline}</p>
        </Reveal>

        <Reveal immediate delay={200}>
          <p className={styles.description}>{category.description}</p>
        </Reveal>

        {lead ? (
          <Reveal immediate delay={280}>
            <p className={styles.lead}>
              <span className={styles.leadLabel}>Lead</span>
              <span className={styles.leadName}>{lead.name}</span>
              <span className={styles.leadRole}>{lead.role}</span>
            </p>
          </Reveal>
        ) : null}

        <Reveal immediate delay={360}>
          {/* A button, not an anchor. A real `href="#…"` would rewrite
              location.hash and the router would read it as a route (D-032). */}
          <button type="button" className={styles.cta} onClick={onEnter}>
            <span>Start exploring</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              ↓
            </span>
          </button>
        </Reveal>
      </div>
    </header>
  )
}
