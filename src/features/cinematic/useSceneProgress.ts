import { useCallback, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Scroll -> damped progress for a single cinematic scene.
 *
 * The shared half of the cinematic runtime: scene-independent, so a category
 * page can drive a background, an atmosphere and a character from it without
 * knowing anything about what is being drawn. `useChapterProgress` does the
 * same job for a *sequence* of chapters on the landing; this is the one-scene
 * case, and both use the same frame-rate independent damping so a scene and a
 * chapter ease identically.
 *
 * `0` while the scene sits at the top of the viewport, rising to `1` once it
 * has been scrolled fully past. Written to CSS custom properties on the scene
 * element once per animation frame and never into React state — at 60fps that
 * would re-render the page on every frame.
 */

/** Frame-rate independent damping: the same easing at 30fps and 144fps. */
function damp(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

export interface SceneProgress {
  /** Attach to the scene element. Receives `--scene-progress`. */
  sceneRef: React.RefObject<HTMLElement | null>
  /** Live damped progress, for canvas draw loops. Never render this. */
  progressRef: React.RefObject<number>
}

export function useSceneProgress(): SceneProgress {
  const sceneRef = useRef<HTMLElement | null>(null)
  const progressRef = useRef<number>(0)
  const targetRef = useRef<number>(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const measure = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    // `100vw` is the wrong tool for the full-bleed break-out below: this page
    // always has a vertical scrollbar and `100vw` includes it, so the scene
    // would overflow horizontally by the scrollbar's width.
    document.documentElement.style.setProperty(
      '--viewport-w',
      `${document.documentElement.clientWidth}px`,
    )

    // How far the scene's own containing block sits from the viewport's left
    // edge. A full-bleed scene needs to cancel exactly that, and the offset
    // cannot be assumed: the category hero sits directly in the app shell's
    // centred container, while an Explore hero is nested one level deeper
    // inside a page section. Guessing it with `calc(50% - 50vw)` put the
    // Explore heroes off-screen to the left with their heading cut away.
    const parent = scene.parentElement
    if (parent) {
      const offset = Math.round(parent.getBoundingClientRect().left)
      scene.style.setProperty('--scene-bleed', `${-offset}px`)
    }

    const rect = scene.getBoundingClientRect()
    // Travel is measured against the scene's own height, so a tall scene and
    // a short one both span 0..1 rather than one feeling faster.
    const travelled = -rect.top / Math.max(1, rect.height)
    targetRef.current = travelled < 0 ? 0 : travelled > 1 ? 1 : travelled
  }, [])

  useEffect(() => {
    measure()
    progressRef.current = targetRef.current

    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    let frame = 0
    let last = performance.now()

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      progressRef.current = prefersReducedMotion
        ? targetRef.current
        : damp(progressRef.current, targetRef.current, 7, dt)

      sceneRef.current?.style.setProperty('--scene-progress', progressRef.current.toFixed(4))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [measure, prefersReducedMotion])

  return { sceneRef, progressRef }
}
