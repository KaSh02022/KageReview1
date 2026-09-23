import { createHashRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { RouteErrorFallback } from '../pages/RouteErrorFallback'
import { HomePage } from '../pages/HomePage'
import { CategoryHubPage } from '../pages/CategoryHubPage'
import { ArticleDetailPage } from '../pages/ArticleDetailPage'
import { CharacterDetailPage } from '../pages/CharacterDetailPage'
import { EventDetailPage } from '../pages/EventDetailPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { SearchPage } from '../pages/SearchPage'
import { TrailersPage } from '../pages/TrailersPage'
import { EventsPage } from '../pages/EventsPage'
import { ReleasesPage } from '../pages/ReleasesPage'
import { MerchandisePage } from '../pages/MerchandisePage'
import { CartPage } from '../pages/CartPage'
import { BookmarksPage } from '../pages/BookmarksPage'
import { ContactPage } from '../pages/ContactPage'
import { AboutPage } from '../pages/AboutPage'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Route "handle.breadcrumb" is read by src/components/Breadcrumb via
 * react-router's useMatches(), so the breadcrumb trail is genuinely
 * derived from route match data (docs/02_PRODUCT_ARCHITECTURE.md §3),
 * not hand-maintained per page.
 */
export const CATEGORY_ROUTES: { path: string; categoryId: string; label: string }[] = [
  { path: 'anime', categoryId: 'anime', label: 'Anime' },
  { path: 'gaming', categoryId: 'gaming', label: 'Gaming' },
  { path: 'movies', categoryId: 'movies', label: 'Movies' },
  { path: 'tv-shows', categoryId: 'tv-shows', label: 'TV Shows' },
  { path: 'k-pop', categoryId: 'kpop', label: 'K-Pop' },
  { path: 'comics', categoryId: 'comics', label: 'Comics' },
  { path: 'manga', categoryId: 'manga', label: 'Manga' },
]

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
    handle: { breadcrumb: 'Home' },
    children: [
      { index: true, element: <HomePage /> },
      ...CATEGORY_ROUTES.map((category) => ({
        path: category.path,
        element: <CategoryHubPage categoryId={category.categoryId} label={category.label} />,
        handle: { breadcrumb: category.label },
      })),
      {
        path: 'category/:slug',
        element: <CategoryHubPage />,
        handle: { breadcrumb: 'Category' },
      },
      { path: 'article/:id', element: <ArticleDetailPage />, handle: { breadcrumb: 'Article' } },
      {
        path: 'character/:id',
        element: <CharacterDetailPage />,
        handle: { breadcrumb: 'Character' },
      },
      { path: 'event/:id', element: <EventDetailPage />, handle: { breadcrumb: 'Event' } },
      { path: 'product/:id', element: <ProductDetailPage />, handle: { breadcrumb: 'Product' } },
      { path: 'search', element: <SearchPage />, handle: { breadcrumb: 'Search' } },
      { path: 'trailers', element: <TrailersPage />, handle: { breadcrumb: 'Trailers' } },
      { path: 'events', element: <EventsPage />, handle: { breadcrumb: 'Events' } },
      { path: 'releases', element: <ReleasesPage />, handle: { breadcrumb: 'Releases' } },
      {
        path: 'merchandise',
        element: <MerchandisePage />,
        handle: { breadcrumb: 'Merchandise' },
      },
      { path: 'cart', element: <CartPage />, handle: { breadcrumb: 'Cart' } },
      { path: 'bookmarks', element: <BookmarksPage />, handle: { breadcrumb: 'Bookmarks' } },
      { path: 'contact', element: <ContactPage />, handle: { breadcrumb: 'Contact Us' } },
      { path: 'about', element: <AboutPage />, handle: { breadcrumb: 'About Us' } },
      { path: '*', element: <NotFoundPage />, handle: { breadcrumb: 'Not Found' } },
    ],
  },
])
