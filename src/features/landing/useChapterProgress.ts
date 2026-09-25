import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Scroll -> fractional chapter progress, the way a cinematic scroll page
 * needs it.
 *
 * The idea is borrowed from the Kage temple experience and reimplemented
 * here; none of its code is used. A page built as a sequence of chapters
 * does not want "which section is on screen" — a boolean per section gives
 * you cuts. It wants one continuous number where the integer part is the
 * chapter you are in and the fraction is how far you have travelled out of
 * it. `2.37` means "37% of the way from chapter 2 towards chapter 3", and a
 * single float like that can drive a camera, a parallax depth, an
 * atmosphere and a rail all at once, with no scene swaps anywhere.
 *
 * Two deliberate choices:
 *
 * 1. **The damped value never goes through React state.** It updates every
 *    animation frame; putting that in state would re-render the whole page
 *    sixty times a second. It is written straight to CSS custom properties
 *    on a target element instead, so CSS does the interpolation work.
 *    Only `activeIndex` is state, because it changes a handful of times per
 *    page.
 *
 * 2. **Anchors are measured, not assumed.** Chapters are different heights,
 *    and a naive `scrollY / pageHeight` makes a tall chapter feel slow and a
 *    short one feel like a jump cut. Each chapter gets the scroll position
 *    at which its own centre meets the viewport centre, so every chapter
 *    occupies the same amount of *progress* regardless of its height.
 */

/** Frame-rate independent damping: the same easing at 30fps and 144fps. */
function damp(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

export interface ChapterProgress {
  /** Ref callback to register each chapter element, in order. */
  registerChapter: (index: number) => (element: HTMLElement | null) => void
  /** The element that receives the `--chapter-*` custom properties. */
  stageRef: React.RefObject<HTMLDivElement | null>
  /** Integer index of the chapter currently closest to the viewport centre. */
  activeIndex: number
  /** Scrolls a chapter to the top of the viewport and moves focus to it. */
  goToChapter: (index: number) => void
  /** Reads the live damped progress. For canvas draw loops, never render. */
  progressRef: React.RefObject<number>
}

export function useChapterProgress(chapterCount: number): ChapterProgress {
  const prefersReducedMotion = usePrefersReducedMotion()

  const chaptersRef = useRef<Array<HTMLElement | null>>([])
  const stageRef = useRef<HTMLDivElement | null>(null)
  const anchorsRef = useRef<number[]>([])
  const progressRef = useRef<number>(0)
  const targetRef = useRef<number>(0)

  const [activeIndex, setActiveIndex] = useState(0)
  // Mirrors `activeIndex` so the animation frame can compare without the
  // effect having to re-subscribe every time the active chapter changes.
  const activeRef = useRef(0)

  const registerChapter = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      chaptersRef.current[index] = element
    },
    [],
  )

  /**
   * Scroll position at which each chapter's centre meets the viewport
   * centre. The first chapter is pinned to the top of the document and the
   * last to the bottom, so progress spans the full scroll range rather than
   * stalling at either end. Anchors are then forced strictly increasing —
   * two chapters resolving to the same anchor would divide by zero below.
   */
  const measure = useCallback(() => {
    const doc = document.documentElement
    const viewportHeight = window.innerHeight
    const maxScroll = Math.max(1, doc.scrollHeight - viewportHeight)

    // The landing escapes the app shell's centred, max-width container to
    // run full-bleed. `100vw` cannot do that job here: this page always has
    // a vertical scrollbar, and `100vw` includes it, so a full-bleed child
    // overflows horizontally by the scrollbar's width. `clientWidth` is the
    // real content box, so it breaks out exactly and overflows by nothing.
    doc.style.setProperty('--viewport-w', `${doc.clientWidth}px`)

    // The site header is sticky, so it covers the top of every full-height
    // chapter. Publishing its measured height lets each stage sit in the
    // space actually visible instead of centring its content against a box
    // that runs underneath the header. Measured rather than taken from a
    // token because the header wraps to two rows at some widths.
    const siteHeader = document.querySelector('header')
    if (siteHeader) {
      doc.style.setProperty('--header-h', `${siteHeader.offsetHeight}px`)
    }

    const anchors = chaptersRef.current.slice(0, chapterCount).map((element, index) => {
      if (index === 0) return 0
      if (index === chapterCount - 1) return maxScroll
      if (!element) return 0
      return clamp(
        element.offsetTop + element.offsetHeight / 2 - viewportHeight / 2,
        0,
        maxScroll,
      )
    })

    for (let i = 1; i < anchors.length; i++) {
      anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1)
    }

    anchorsRef.current = anchors
  }, [chapterCount])

  /** Fractional chapter index for a scroll position. */
  const progressFor = useCallback((scrollY: number): number => {
    const anchors = anchorsRef.current
    if (anchors.length < 2) return 0
    if (scrollY <= anchors[0]) return 0

    for (let i = 0; i < anchors.length - 1; i++) {
      if (scrollY <= anchors[i + 1]) {
        return i + (scrollY - anchors[i]) / (anchors[i + 1] - anchors[i])
      }
    }
    return anchors.length - 1
  }, [])

  useEffect(() => {
    measure()

    // Chapter heights depend on images and fonts that land after mount, so
    // re-measure whenever any chapter changes size rather than on resize
    // alone — otherwise every anchor is computed against a shorter page.
    //
    // Feature-detected rather than assumed: the window resize listener below
    // is enough to keep the page correct on its own, so an environment
    // without ResizeObserver loses re-measurement on late content, not the
    // page. (jsdom is one such environment.)
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      chaptersRef.current.slice(0, chapterCount).forEach((element) => {
        if (element) observer?.observe(element)
      })
      observer.observe(document.body)
    }

    function handleScroll() {
      targetRef.current = progressFor(window.scrollY)
    }

    handleScroll()
    // Reduced motion gets the target directly: no easing, but every chapter
    // still reports its progress, so nothing depends on the animation loop
    // to become readable.
    progressRef.current = targetRef.current

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', measure)

    let frame = 0
    let lastTime = performance.now()

    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      progressRef.current = prefersReducedMotion
        ? targetRef.current
        : damp(progressRef.current, targetRef.current, 7, dt)

      const progress = progressRef.current
      const stage = stageRef.current
      if (stage) {
        stage.style.setProperty('--chapter-progress', progress.toFixed(4))
        stage.style.setProperty('--chapter-index', String(Math.round(progress)))
      }

      const nearest = clamp(Math.round(progress), 0, chapterCount - 1)
      if (nearest !== activeRef.current) {
        activeRef.current = nearest
        setActiveIndex(nearest)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', measure)
    }
  }, [chapterCount, measure, progressFor, prefersReducedMotion])

  const goToChapter = useCallback(
    (index: number) => {
      const element = chaptersRef.current[index]
      if (!element) return
      element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      // Focus without a second scroll — scrollIntoView is already doing it,
      // and letting focus scroll as well fights the smooth animation.
      element.focus({ preventScroll: true })
    },
    [prefersReducedMotion],
  )

  return { registerChapter, stageRef, activeIndex, goToChapter, progressRef }
}
