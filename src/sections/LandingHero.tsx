import { Link } from 'react-router-dom'
import { CinematicEntry } from '../features/universe/CinematicEntry'
import { LANDING_HERO_ART } from '../data/landingAssets'
import styles from './LandingHero.module.css'

/**
 * Landing hero.
 *
 * Wraps `CinematicEntry` rather than replacing it. CinematicEntry owns the
 * page's only `<h1>` and the whole Fandom Core progressive-enhancement
 * stack (WebGL canvas → 2D fallback → the seven accessible category
 * links), so it is left completely untouched; this section only adds the
 * cinematic backdrop behind it and the call-to-action row beneath it.
 *
 * The backdrop is `aria-hidden` and purely decorative — every piece of
 * information and every interactive target lives in real DOM above it.
 */
export function LandingHero() {
  return (
    <section className={styles.hero} aria-label="FandomVerse introduction">
      <div className={styles.backdrop} aria-hidden="true">
        <img
          className={styles.backdropImage}
          src={LANDING_HERO_ART}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.backdropScrim} />
        <div className={styles.drift} />
      </div>

      <div className={styles.content}>
        <CinematicEntry />

        <div className={styles.actions}>
          <Link to="/anime" className={`${styles.cta} ${styles.ctaPrimary}`}>
            <span>Enter the universe</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
          <Link to="/search" className={`${styles.cta} ${styles.ctaGhost}`}>
            <span>Browse everything</span>
          </Link>
        </div>

        <p className={styles.heroNote}>
          Seven original worlds — characters, events, releases and fan coverage, all in one portal.
        </p>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>
    </section>
  )
}
