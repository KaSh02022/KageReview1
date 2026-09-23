/**
 * Pure camera-parallax math, extracted out of the R3F `useFrame` loop so
 * it's unit-testable without a real WebGL context (Director's Phase 4
 * §17: "camera behavior where practical"). Deterministic, no side
 * effects: given normalized pointer coordinates, returns the *target*
 * rig rotation — the smoothing/lerp toward this target still happens
 * per-frame in FandomCoreScene via `MathUtils.damp`.
 */
export interface ParallaxInput {
  pointerX: number
  pointerY: number
  reducedMotion: boolean
  isMobile: boolean
}

export interface ParallaxTarget {
  rotationX: number
  rotationY: number
}

const DESKTOP_STRENGTH = 0.18
const MOBILE_STRENGTH = 0.08

export function computeParallaxRotation({
  pointerX,
  pointerY,
  reducedMotion,
  isMobile,
}: ParallaxInput): ParallaxTarget {
  if (reducedMotion) {
    return { rotationX: 0, rotationY: 0 }
  }
  const strength = isMobile ? MOBILE_STRENGTH : DESKTOP_STRENGTH
  return {
    rotationX: pointerY * strength,
    rotationY: pointerX * strength,
  }
}
