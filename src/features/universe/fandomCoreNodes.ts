import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'

export interface FandomCoreNode {
  categoryId: string
  path: string
  label: string
  /** CSS custom property name (docs/04_DESIGN_SYSTEM.md §9) — never a second color system. */
  accentVar: string
  /** Evenly spaced around the orbit, starting at the top, clockwise. */
  angleDeg: number
}

/**
 * The seven Fandom Core nodes, derived from the same CATEGORY_ROUTES the
 * rest of the app's navigation uses (docs/02_PRODUCT_ARCHITECTURE.md §3) —
 * not a second, parallel category list that could drift out of sync.
 */
export const FANDOM_CORE_NODES: FandomCoreNode[] = CATEGORY_ROUTES.map((category, index) => ({
  categoryId: category.categoryId,
  path: category.path,
  label: category.label,
  accentVar: `--color-accent-${category.categoryId.replace('-', '')}`,
  angleDeg: (360 / CATEGORY_ROUTES.length) * index - 90,
}))
