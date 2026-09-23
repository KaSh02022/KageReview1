import { describe, it, expect } from 'vitest'
import { FANDOM_CORE_NODES } from './fandomCoreNodes'
import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'

describe('FANDOM_CORE_NODES', () => {
  it('has exactly seven nodes, one per fandom category', () => {
    expect(FANDOM_CORE_NODES).toHaveLength(7)
  })

  it('maps every node to a real category route (navigation mapping)', () => {
    const routePaths = new Set(CATEGORY_ROUTES.map((route) => route.path))
    for (const node of FANDOM_CORE_NODES) {
      expect(routePaths.has(node.path)).toBe(true)
    }
  })

  it('assigns each node a distinct, evenly-spaced angle around the orbit', () => {
    const angles = FANDOM_CORE_NODES.map((node) => node.angleDeg)
    const uniqueAngles = new Set(angles)
    expect(uniqueAngles.size).toBe(7)

    // Evenly spaced: consecutive angles should differ by 360/7 (within float tolerance).
    const step = 360 / 7
    for (let i = 1; i < angles.length; i += 1) {
      expect(angles[i] - angles[i - 1]).toBeCloseTo(step, 5)
    }
  })

  it('references a real design-token accent variable per node (no second color system)', () => {
    for (const node of FANDOM_CORE_NODES) {
      expect(node.accentVar).toMatch(/^--color-accent-[a-z]+$/)
    }
  })

  it('labels match the shared CATEGORY_ROUTES list exactly (single source of truth)', () => {
    const labels = FANDOM_CORE_NODES.map((node) => node.label)
    const expectedLabels = CATEGORY_ROUTES.map((route) => route.label)
    expect(labels).toEqual(expectedLabels)
  })
})
