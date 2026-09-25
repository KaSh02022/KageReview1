import { CinematicEntry } from '../features/universe/CinematicEntry'
import { Reveal } from '../components/Reveal/Reveal'
import styles from './ChapterIntro.module.css'

interface ChapterIntroProps {
  registerRef: (element: HTMLElement | null) => void
}

/**
 * Chapter 00 — the threshold.
 *
 * Wraps `CinematicEntry` rather than replacing it. That component owns the
 * page's only `<h1>`, the WebGL Fandom Core, and the progressive-enhancement
 * chain behind it (canvas → 2D fallback → seven real category links), all of
 * which is covered by its own tests. It is the hero *artwork* layer here;
 * everything this section adds sits around it.
 *
 * The editorial frame — a chapter marker above, a statement and a scroll cue
 * below — is what turns a centred hero into the opening page of a book.
 */
export function ChapterIntro({ registerRef }: ChapterIntroProps) {
  return (
    <section
      ref={registerRef}
      tabIndex={-1}
      className={styles.intro}
      aria-label="FandomVerse introduction"
    >
      <div className={styles.frame}>
        <Reveal immediate className={styles.marker}>
          <span className={styles.number}>00</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.markerLabel}>The threshold</span>
        </Reveal>

        <div className={styles.core}>
          <CinematicEntry />
        </div>

        <Reveal immediate delay={220} className={styles.statement}>
          <p className={styles.statementLead}>Enter the universe</p>
          <p className={styles.statementWords}>
            <span>Characters.</span> <span>Worlds.</span> <span>Stories.</span>
          </p>
        </Reveal>
      </div>

      <div className={styles.cue} aria-hidden="true">
        <span className={styles.cueLabel}>Scroll to explore</span>
        <span className={styles.cueTrack}>
          <i className={styles.cueDot} />
        </span>
      </div>
    </section>
  )
}
