export interface CategoryRoute {
  path: string
  categoryId: string
  label: string
}

/**
 * The 7 fandom category route entries — kept in their own module (not
 * inside routes.tsx) specifically so anything that needs the category
 * list (Header, HomePage, the Fandom Core scene) can import it without
 * creating a circular dependency through routes.tsx, which itself imports
 * page components that need this list (a real Phase 4 bug found via a
 * hanging/failing test suite — see docs/11_DECISION_LOG.md).
 */
export const CATEGORY_ROUTES: CategoryRoute[] = [
  { path: 'anime', categoryId: 'anime', label: 'Anime' },
  { path: 'gaming', categoryId: 'gaming', label: 'Gaming' },
  { path: 'movies', categoryId: 'movies', label: 'Movies' },
  { path: 'tv-shows', categoryId: 'tv-shows', label: 'TV Shows' },
  { path: 'k-pop', categoryId: 'kpop', label: 'K-Pop' },
  { path: 'comics', categoryId: 'comics', label: 'Comics' },
  { path: 'manga', categoryId: 'manga', label: 'Manga' },
]
