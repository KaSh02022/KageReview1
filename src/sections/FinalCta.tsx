import { Link } from 'react-router-dom'
import { CATEGORY_HERO_ART_WIDE } from '../data/landingAssets'
import { Reveal } from '../components/Reveal/Reveal'
import styles from './FinalCta.module.css'

/**
 * Closing call to action.
 *
 * Uses the K-Pop key art as its backdrop specifically because it is the
 * brightest of the seven — the page has been dark throughout, so ending on
 * the one image with real light gives the scroll somewhere to arrive.
 */
export function FinalCta() {
  return (
    <Reveal as="section" aria-labelledby="final-cta-heading" className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.backdrop} aria-hidden="true">
          <img className={styles.image} src={CATEGORY_HERO_ART_WIDE.kpop} alt="" loading="lazy" decoding="async" />
          <span className={styles.scrim} />
          <span className={styles.motif} />
        </div>

        <div className={styles.content}>
          <h2 id="final-cta-heading" className={styles.title}>
            Start with one world
          </h2>
          <p className={styles.body}>
            You can always cross into the others. Everything here is original fiction, built for this
            portal.
          </p>
          <div className={styles.actions}>
            {/* Distinct from the hero's "Enter the universe", which shares
                this destination — two identical link names on one page is
                ambiguous to a screen reader running a links list, and the
                label now matches this section's own heading. */}
            <Link to="/anime" className={`${styles.cta} ${styles.ctaPrimary}`}>
              <span>Start with Anime</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </Link>
            <Link to="/about" className={`${styles.cta} ${styles.ctaGhost}`}>
              <span>What is FandomVerse?</span>
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
