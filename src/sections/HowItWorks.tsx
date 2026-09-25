import { Reveal } from '../components/Reveal/Reveal'
import styles from './HowItWorks.module.css'

/**
 * Three-step orientation. Deliberately short — the brief asks for visual
 * storytelling over paragraphs, so each step is one line plus a numeral
 * that carries the visual weight.
 */
const STEPS = [
  {
    number: '01',
    title: 'Pick a world',
    body: 'Seven fandoms, each with its own characters, releases and events.',
  },
  {
    number: '02',
    title: 'Go deeper',
    body: 'Profiles, articles, galleries and trailers — all inside the world you chose.',
  },
  {
    number: '03',
    title: 'Keep what matters',
    body: 'Bookmark what you want to come back to, and pick up where you left off.',
  },
] as const

export function HowItWorks() {
  return (
    <Reveal as="section" aria-labelledby="how-it-works-heading" className={styles.section}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>How it works</p>
        <h2 id="how-it-works-heading" className={styles.title}>
          Three steps in
        </h2>
      </header>

      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.number} className={styles.step}>
            <Reveal delay={index * 110}>
              <div className={styles.stepInner}>
                <span className={styles.number} aria-hidden="true">
                  {step.number}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
