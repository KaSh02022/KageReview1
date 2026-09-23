import { useMemo } from 'react'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'

/**
 * Three.js materials need real color values, not CSS var() references — this
 * reads each category accent's *computed* value from the design tokens
 * (docs/04_DESIGN_SYSTEM.md §9) once, so the 3D scene reuses the exact same
 * palette as every Card/Badge in the app rather than a second, hand-picked
 * "3D-only" color set.
 */
export function useCategoryAccentColors(): Record<string, string> {
  return useMemo(() => {
    if (typeof window === 'undefined') return {}
    const computed = getComputedStyle(document.documentElement)
    const colors: Record<string, string> = {}
    for (const node of FANDOM_CORE_NODES) {
      const value = computed.getPropertyValue(node.accentVar).trim()
      if (value) colors[node.categoryId] = value
    }
    return colors
  }, [])
}
