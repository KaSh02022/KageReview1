import { useLocation } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { getCategoryById } from '../data'
import { CHAPTER_ACCENT_RGB, INTRO_ACCENT_RGB } from '../features/landing/chapterAccents'

export type ChromeVariant = 'category' | 'explore' | 'default'

const EXPLORE_PATHS = ['/trailers', '/events', '/merchandise']

export interface RouteAccent {
  /** An `r, g, b` triplet for `rgb()` / `rgba()`. */
  accentRgb: string
  variant: ChromeVariant
}

/**
 * The colour of the world you are standing in, read from the route.
 *
 * Shared by the header and the footer so the bar that opens the page and the
 * rule that closes it agree, without either having to be told which category
 * is open and without the accent being computed twice in two components.
 *
 * The value comes from the existing category map — no colour is invented
 * here, and nothing is hardcoded per page. Off a category route it falls back
 * to the brand primary.
 */
export function useRouteAccent(): RouteAccent {
  const { pathname } = useLocation()
  const activeCategory = CATEGORY_ROUTES.find((route) => pathname === `/${route.path}`)
  const category = activeCategory ? getCategoryById(activeCategory.categoryId) : undefined

  return {
    accentRgb: category ? CHAPTER_ACCENT_RGB[category.id] : INTRO_ACCENT_RGB,
    variant: activeCategory ? 'category' : EXPLORE_PATHS.includes(pathname) ? 'explore' : 'default',
  }
}
