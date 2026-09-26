import { describe, it, expect } from 'vitest'
import { computeParallaxRotation } from './computeParallaxRotation'

describe('computeParallaxRotation (camera behavior, Phase 4 §7/§17)', () => {
  it('returns zero rotation when reduced motion is preferred, regardless of pointer position', () => {
    const result = computeParallaxRotation({
      pointerX: 1,
      pointerY: -1,
      reducedMotion: true,
      isMobile: false,
    })
    expect(result).toEqual({ rotationX: 0, rotationY: 0 })
  })

  it('is deterministic: centered pointer always yields zero rotation', () => {
    const result = computeParallaxRotation({
      pointerX: 0,
      pointerY: 0,
      reducedMotion: false,
      isMobile: false,
    })
    expect(result).toEqual({ rotationX: 0, rotationY: 0 })
  })

  it('scales rotation with pointer position, desktop strength', () => {
    const result = computeParallaxRotation({
      pointerX: 1,
      pointerY: 1,
      reducedMotion: false,
      isMobile: false,
    })
    expect(result.rotationX).toBeCloseTo(0.18, 5)
    expect(result.rotationY).toBeCloseTo(0.18, 5)
  })

  it('uses a smaller, less dizzying strength on mobile than desktop', () => {
    const desktop = computeParallaxRotation({
      pointerX: 1,
      pointerY: 1,
      reducedMotion: false,
      isMobile: false,
    })
    const mobile = computeParallaxRotation({
      pointerX: 1,
      pointerY: 1,
      reducedMotion: false,
      isMobile: true,
    })
    expect(mobile.rotationX).toBeLessThan(desktop.rotationX)
    expect(mobile.rotationY).toBeLessThan(desktop.rotationY)
  })

  it('never produces uncontrolled/unbounded rotation for any pointer input within [-1, 1]', () => {
    for (const x of [-1, -0.5, 0, 0.5, 1]) {
      for (const y of [-1, -0.5, 0, 0.5, 1]) {
        const result = computeParallaxRotation({ pointerX: x, pointerY: y, reducedMotion: false, isMobile: false })
        expect(Math.abs(result.rotationX)).toBeLessThanOrEqual(0.18)
        expect(Math.abs(result.rotationY)).toBeLessThanOrEqual(0.18)
      }
    }
  })
})
