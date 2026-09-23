import { useState } from 'react'

function detectWebgl(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Detects WebGL availability for the cinematic entry's progressive
 * enhancement path (docs/02_PRODUCT_ARCHITECTURE.md §8, Phase 4 scope).
 * Full cinematic scene implementation lives in Phase 4 — this hook only
 * establishes the detection contract so the fallback wiring can be built
 * in Phase 1.
 *
 * The lazy useState initializer runs the (pure, side-effect-free) detection
 * during render, so no effect/setState-in-effect is needed — safe even
 * under StrictMode's double-invoke of initializers.
 */
export function useWebglSupport(): boolean {
  const [supported] = useState(detectWebgl)
  return supported
}
