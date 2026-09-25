import type { CSSProperties } from 'react'
import { AtmosphereCanvas } from '../landing/AtmosphereCanvas'
import { WordReveal } from '../landing/WordReveal'
import { Reveal } from '../../components/Reveal/Reveal'
import { useSceneProgress } from '../cinematic/useSceneProgress'
import { EXPLORE_PLATES, type ExploreSurface } from './explorePlates'
import styles from './ExploreCinematicHero.module.css'

interface ExploreCinematicHeroProps {
  surface: ExploreSurface
  /** Becomes the page's only `<h1>`. */
  title: string
  /** The small label above the title. */
  eyebrow: string
  description: string
  /** `r, g, b`. Defaults to the brand primary. */
  accent?: string
}

const PLATE_BASE = '/landing-pages/secret-pathways-assets/generated'

export function ExploreCinematicHero({
  surface,
  title,
  eyebrow,
  description,
  accent = '124, 141, 255',
}: ExploreCinematicHeroProps) {
  const { sceneRef, progressRef } = useSceneProgress()

  return (
    <header
      ref={sceneRef as React.RefObject<HTMLElement>}
      className={styles.scene}
      style={{ '--accent-rgb': accent } as CSSProperties}
    >
      <div className={styles.plate} aria-hidden="true">
        <img
          className={styles.plateImage}
          src={`${PLATE_BASE}/${EXPLORE_PLATES[surface]}.webp`}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className={styles.haze} aria-hidden="true" />
      <AtmosphereCanvas progressRef={progressRef} accent={accent} />
      <div className={styles.edge} aria-hidden="true" />

      <div className={styles.content}>
        <Reveal immediate className={styles.marker}>
          <span className={styles.rule} aria-hidden="true" />
          <span>{eyebrow}</span>
        </Reveal>

        <WordReveal as="h1" className={styles.title} text={title} />

        <Reveal immediate delay={140}>
          <p className={styles.description}>{description}</p>
        </Reveal>
      </div>
    </header>
  )
}
