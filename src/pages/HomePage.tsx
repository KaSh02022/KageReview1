import { useMemo } from 'react'
import { characters, getCategoryById } from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { FEATURED_CHARACTER_IDS } from '../data/landingAssets'
import {
  CHAPTER_ACCENT_RGB,
  INTRO_ACCENT_RGB,
} from '../features/landing/chapterAccents'
import { useChapterProgress } from '../features/landing/useChapterProgress'
import { AtmosphereCanvas } from '../features/landing/AtmosphereCanvas'
import { ChapterRail, type RailEntry } from '../features/landing/ChapterRail'
import { ChapterIntro } from '../sections/ChapterIntro'
import { ChapterIndex } from '../sections/ChapterIndex'
import { CategoryChapter } from '../sections/CategoryChapter'
import { UniverseStatement } from '../sections/UniverseStatement'
import { FinalCta } from '../sections/FinalCta'
import styles from './HomePage.module.css'

/**
 * Landing page — a universe travelled by scrolling.
 *
 * The page is a sequence of chapters rather than a stack of sections. One
 * number, the fractional chapter progress, is written to `stageRef` once per
 * animation frame; every chapter inherits it and derives its own parallax
 * from it in CSS. Nothing subscribes to scroll individually and nothing
 * re-renders on scroll — the only React state in the whole choreography is
 * which chapter is active, which changes about ten times per page.
 *
 * Chapter space:
 *
 * ```
 *   0  intro          the threshold
 *   1  contents       the seven worlds listed
 *   2… seven chapters one per category, in canonical order
 *   9  statement      what holds them together
 *  10  final CTA      go
 * ```
 *
 * The rail exposes indices 2–8 as chapters 01–07; the framing sections are
 * not destinations.
 */

/** Chapter index at which the seven category chapters begin. */
const FIRST_CATEGORY_CHAPTER = 2

export function HomePage() {
  const chapterCount = FIRST_CATEGORY_CHAPTER + CATEGORY_ROUTES.length + 2

  const { registerChapter, stageRef, activeIndex, goToChapter, progressRef } =
    useChapterProgress(chapterCount)

  /**
   * One representative lead per world. The dataset holds all 35 characters
   * and keeps them; the landing page shows seven, because a chapter is a
   * portrait of a world and not a roster of it.
   */
  const leads = useMemo(() => {
    const byId = new Map(characters.map((character) => [character.id, character]))
    return FEATURED_CHARACTER_IDS.map((id) => byId.get(id))
  }, [])

  const railEntries: RailEntry[] = useMemo(
    () =>
      CATEGORY_ROUTES.map((route, index) => {
        const category = getCategoryById(route.categoryId)
        return {
          index: FIRST_CATEGORY_CHAPTER + index,
          number: String(index + 1).padStart(2, '0'),
          label: category?.name ?? route.path,
          accent: category
            ? `rgb(${CHAPTER_ACCENT_RGB[category.id]})`
            : `rgb(${INTRO_ACCENT_RGB})`,
        }
      }),
    [],
  )

  /**
   * The atmosphere takes the accent of the chapter being read, so the air
   * itself shifts colour as the reader moves between worlds. Outside the
   * seven chapters it falls back to the brand primary.
   */
  const activeAccent = useMemo(() => {
    const route = CATEGORY_ROUTES[activeIndex - FIRST_CATEGORY_CHAPTER]
    const category = route ? getCategoryById(route.categoryId) : undefined
    return category ? CHAPTER_ACCENT_RGB[category.id] : INTRO_ACCENT_RGB
  }, [activeIndex])

  return (
    <div className={styles.stage} ref={stageRef}>
      <AtmosphereCanvas progressRef={progressRef} accent={activeAccent} />

      <div className={styles.flow}>
        <ChapterIntro registerRef={registerChapter(0)} />
        <ChapterIndex registerRef={registerChapter(1)} />

        {CATEGORY_ROUTES.map((route, index) => {
          const category = getCategoryById(route.categoryId)
          if (!category) return null
          const chapterIndex = FIRST_CATEGORY_CHAPTER + index

          return (
            <CategoryChapter
              key={route.path}
              category={category}
              lead={leads[index]}
              number={String(index + 1).padStart(2, '0')}
              chapterIndex={chapterIndex}
              path={route.path}
              registerRef={registerChapter(chapterIndex)}
              isActive={activeIndex === chapterIndex}
            />
          )
        })}

        <UniverseStatement
          registerRef={registerChapter(FIRST_CATEGORY_CHAPTER + CATEGORY_ROUTES.length)}
          characterCount={characters.length}
        />

        <div
          ref={registerChapter(FIRST_CATEGORY_CHAPTER + CATEGORY_ROUTES.length + 1)}
          className={styles.closing}
        >
          <FinalCta />
        </div>
      </div>

      <ChapterRail entries={railEntries} activeIndex={activeIndex} onSelect={goToChapter} />
    </div>
  )
}
