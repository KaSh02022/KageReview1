import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import styles from './AtmosphereCanvas.module.css'

interface AtmosphereCanvasProps {
  /** Live damped chapter progress. Read per frame, never rendered. */
  progressRef: React.RefObject<number>
  /** Accent of the active chapter, as an `r, g, b` triplet. */
  accent: string
}

interface Mote {
  x: number
  y: number
  /** 0 = far, 1 = near. Drives size, speed, opacity and parallax throw. */
  depth: number
  radius: number
  drift: number
  phase: number
}

/**
 * The environmental layer the chapters travel through.
 *
 * A 2D canvas, not WebGL, and deliberately so. The page already runs one
 * WebGL context for the Fandom Core; a second one competing for contexts is
 * a real failure mode on low-end devices, and a full 3D environment would
 * cost far more than this page can justify. What the composition actually
 * needs from a "camera" is depth parallax and atmosphere, and a few hundred
 * depth-sorted motes give exactly that for a few kilobytes and no new
 * dependency.
 *
 * Scroll progress moves the field vertically by depth, so far motes barely
 * shift while near ones sweep past — the same cue a dolly shot gives.
 */
export function AtmosphereCanvas({ progressRef, accent }: AtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const accentRef = useRef(accent)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Mirrored into a ref so the draw loop can read the current accent without
  // the animation effect listing it as a dependency — a colour change would
  // otherwise tear down and rebuild the whole mote field.
  useEffect(() => {
    accentRef.current = accent
  }, [accent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let width = 0
    let height = 0
    let motes: Mote[] = []

    function resize() {
      if (!canvas || !context) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height

      // Capping DPR matters more here than anywhere else on the page: this
      // canvas is full-viewport, so an uncapped 3x phone would rasterise
      // roughly nine times the pixels for motes a few pixels across.
      const isSmall = width < 768
      const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2)

      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Density by area, so a phone does not render a desktop's mote count
      // in a fraction of the space.
      const target = Math.round((width * height) / (isSmall ? 26_000 : 15_000))
      const count = Math.max(24, Math.min(target, isSmall ? 70 : 190))

      motes = Array.from({ length: count }, (_, i) => {
        const depth = (i % 12) / 11
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          radius: 0.4 + depth * 1.9,
          drift: (0.08 + depth * 0.5) * (Math.random() < 0.5 ? -1 : 1),
          phase: Math.random() * Math.PI * 2,
        }
      })
    }

    function paint(elapsed: number) {
      if (!canvas || !context) return
      const progress = progressRef.current ?? 0
      context.clearRect(0, 0, width, height)

      for (const mote of motes) {
        // Near motes travel much further per chapter than far ones. This is
        // the whole parallax effect: one number, thrown by depth.
        const throwDistance = 40 + mote.depth * 260
        const y = ((mote.y - progress * throwDistance) % height + height) % height
        const sway = Math.sin(elapsed * 0.00022 * (0.4 + mote.depth) + mote.phase)
        const x = ((mote.x + sway * mote.drift * 30) % width + width) % width

        const alpha = 0.05 + mote.depth * 0.3
        context.beginPath()
        context.arc(x, y, mote.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(${accentRef.current}, ${alpha.toFixed(3)})`
        context.fill()
      }
    }

    resize()

    // Feature-detected: without it the field simply does not re-fit on
    // resize, which is a far better outcome than the page failing to render.
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        resize()
        paint(0)
      })
      observer.observe(canvas)
    }

    if (prefersReducedMotion) {
      // Still a composed field with depth — it simply does not move.
      paint(0)
      return () => observer?.disconnect()
    }

    let frame = 0
    const start = performance.now()
    function tick(now: number) {
      paint(now - start)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [progressRef, prefersReducedMotion])

  return (
    <div className={styles.field} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
