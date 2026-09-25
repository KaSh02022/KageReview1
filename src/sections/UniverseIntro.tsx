import { categories } from '../data'
import { Reveal } from '../components/Reveal/Reveal'
import type { CategoryId } from '../types/content'
import styles from './UniverseIntro.module.css'

/**
 * Explains the "one universe, seven worlds" idea, and shows it.
 *
 * The diagram is a pure-CSS orbit: seven accent nodes positioned with
 * `cos()`/`sin()` around a shared core — the same geometric language the
 * Fandom Core uses, rebuilt here without WebGL so this section costs
 * nothing to render. It is decorative and `aria-hidden`; the same
 * information is carried by the category list elsewhere on the page.
 */
export function UniverseIntro() {
  return (
    <Reveal as="section" aria-labelledby="universe-intro-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The FandomVerse</p>
          <h2 id="universe-intro-heading" className={styles.title}>
            One universe, seven worlds
          </h2>
          <p className={styles.body}>
            FandomVerse gathers seven original fandoms into a single portal. Each world keeps its own
            light, materials and mood — but they share one design language, so moving between them
            feels like walking through rooms of the same building rather than opening seven different
            sites.
          </p>
          <p className={styles.body}>
            Every character, event, release and article here is original fiction written for this
            project. Nothing is borrowed from a real franchise.
          </p>

          <ul className={styles.stats}>
            <li className={styles.stat}>
              <span className={styles.statValue}>7</span>
              <span className={styles.statLabel}>Worlds</span>
            </li>
            <li className={styles.stat}>
              <span className={styles.statValue}>35</span>
              <span className={styles.statLabel}>Characters</span>
            </li>
            <li className={styles.stat}>
              <span className={styles.statValue}>21</span>
              <span className={styles.statLabel}>Events</span>
            </li>
          </ul>
        </div>

        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.core} />
          <span className={styles.ring} />
          <span className={styles.ringOuter} />
          {categories.map((category, index) => {
            const accentVar = `var(--color-accent-${(category.id as CategoryId).replace('-', '')})`
            return (
              <span
                key={category.id}
                className={styles.node}
                style={
                  {
                    '--node-angle': `${(360 / categories.length) * index - 90}deg`,
                    '--node-accent': accentVar,
                    '--node-delay': `${index * 0.42}s`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </div>
      </div>
    </Reveal>
  )
}
