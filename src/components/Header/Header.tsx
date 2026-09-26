import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'
import { useRouteAccent } from '../../hooks/useRouteAccent'
import { useCartStore } from '../../stores/cartStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { useUiStore } from '../../stores/uiStore'
import { useScrolled } from '../../hooks/useScrolled'
import { GlobalSearchBar } from '../GlobalSearchBar/GlobalSearchBar'
import { Container } from '../ui/Layout/Container'
import { IconButton } from '../ui/Button/IconButton'
import { Badge } from '../ui/Badge/Badge'
import { Drawer } from '../ui/Drawer/Drawer'
import styles from './Header.module.css'

/** The Explore surfaces. Secondary to the seven worlds, so they sit in the
 *  drawer and the footer rather than competing with the primary navigation. */
const EXPLORE_LINKS = [
  { to: '/trailers', label: 'Trailers' },
  { to: '/events', label: 'Events' },
  { to: '/merchandise', label: 'Merchandise' },
  { to: '/quiz', label: 'Fandom Quiz' },
]

/**
 * The global header — one bar, every route except the cinematic landing.
 *
 * `/` renders its own bar inside the Kage document, so this component is not
 * a second header competing with it: it is the same design language rebuilt
 * in React for Category and Explore. Brand, micro-type, dark glass, hairline
 * and the drawn active underline all come from the shared `--chrome-*` tokens,
 * so there is one language and one implementation rather than three headers.
 *
 * Layout is an explicit grid — `brand | navigation | search | account` — not
 * `space-between`, so the four regions keep stable positions across viewports
 * instead of drifting as their contents change width.
 *
 * Nav collapse point uses the canonical tablet/desktop boundary (1023/1024 —
 * docs/04_DESIGN_SYSTEM.md §2b): seven links plus search and account controls
 * do not fit comfortably below the desktop tier, so tablet and mobile both get
 * the drawer.
 */
export function Header() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  )
  const bookmarksCount = useBookmarksStore((state) => state.entries.length)
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen)
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const closeMobileNav = useUiStore((state) => state.closeMobileNav)
  const isDummyLoggedIn = useUiStore((state) => state.isDummyLoggedIn)
  const openDummyAuth = useUiStore((state) => state.openDummyAuth)
  const setDummyLoggedIn = useUiStore((state) => state.setDummyLoggedIn)

  const isScrolled = useScrolled()

  /**
   * Below the desktop tier the search field would either force the bar to wrap
   * or squeeze the brand, so it collapses to a control that reveals a full
   * width row beneath the bar. Escape closes it and focus returns to the
   * control, so it is operable without a pointer.
   */
  const [isSearchOpen, setSearchOpen] = useState(false)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSearchOpen) return
    searchPanelRef.current?.querySelector('input')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSearchOpen(false)
      searchToggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isSearchOpen])

  /**
   * The bar takes the colour of the world you are standing in. Shared with the
   * footer through one hook, so the two never disagree and the accent is not
   * computed twice.
   */
  const { accentRgb, variant } = useRouteAccent()

  const categoryLinks = (onNavigate?: () => void) =>
    CATEGORY_ROUTES.map((route) => (
      <NavLink
        key={route.path}
        to={`/${route.path}`}
        className={styles.navLink}
        onClick={onNavigate}
      >
        {route.label}
      </NavLink>
    ))

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}
      data-variant={variant}
      style={{ '--header-accent': accentRgb } as CSSProperties}
    >
      <Container>
        <div className={styles.bar}>
          <NavLink to="/" className={styles.brand}>
            <b>FandomVerse</b>
            <i>Portal for Fandom World</i>
          </NavLink>

          <nav
            id="primary-navigation"
            aria-label="Fandom categories"
            className={styles.primaryNav}
          >
            {categoryLinks()}
          </nav>

          {/* Search moved here from its own inline field (2026-09-26): at
              every width it used to sit in a fixed-width slot squeezed
              directly between the nav and the account controls, reading
              cramped even at desktop where there was technically room. A
              single icon that reveals the existing full-width
              `.searchPanel` below the bar (already built for narrow
              viewports) keeps search "in the global header on every route"
              (FR-009) without permanently occupying bar space — same
              GlobalSearchBar, same query behaviour, just not wedged inline.
              Kept as its own bar child rather than nested in `.account`,
              which is hidden below the desktop tier — search must not
              disappear with it. */}
          <button
            type="button"
            ref={searchToggleRef}
            className={styles.searchToggle}
            aria-expanded={isSearchOpen}
            aria-controls="header-search-panel"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <span aria-hidden="true">⌕</span>
            <span className="visually-hidden">Search</span>
          </button>

          <div className={styles.account}>
            {/* Text, not emoji. The bar's icon vocabulary is typographic
                (the burger, the arrows, the close glyph); a full-colour
                bookmark and trolley were the only saturated objects left in a
                monochrome cinematic bar. Naming them in the chrome's own
                micro-type also means the visible label and the accessible
                name are the same string. */}
            <NavLink to="/bookmarks" className={styles.iconLink}>
              Bookmarks
              {bookmarksCount > 0 && (
                <Badge tone="primary" shape="pill" className={styles.badge}>
                  {bookmarksCount}
                </Badge>
              )}
            </NavLink>
            <NavLink to="/cart" className={styles.iconLink}>
              Cart
              {cartCount > 0 && (
                <Badge tone="primary" shape="pill" className={styles.badge}>
                  {cartCount}
                </Badge>
              )}
            </NavLink>

            {/* Both controls open the same auth modal; the distinction is
                visual emphasis, not behaviour, so no auth logic changes
                here. "(demo)" removed from the visible label (2026-09-26,
                UI/Copy Cleanup) — the underlying behaviour (local-only,
                no real account) is unchanged, see DummyAuthModal.tsx. */}
            {isDummyLoggedIn ? (
              <button type="button" className={styles.ghostAction} onClick={() => setDummyLoggedIn(false)}>
                Log out
              </button>
            ) : (
              <>
                <button type="button" className={styles.textAction} onClick={openDummyAuth}>
                  Log in
                </button>
                <button type="button" className={styles.ghostAction} onClick={openDummyAuth}>
                  Sign up
                </button>
              </>
            )}
          </div>

          <IconButton
            label="Toggle navigation menu"
            icon="☰"
            variant="outline"
            className={styles.mobileNavToggle}
            aria-expanded={isMobileNavOpen}
            onClick={openMobileNav}
          />
        </div>

        {isSearchOpen && (
          <div id="header-search-panel" ref={searchPanelRef} className={styles.searchPanel}>
            <GlobalSearchBar />
          </div>
        )}
      </Container>

      <Drawer isOpen={isMobileNavOpen} onClose={closeMobileNav} title="Browse FandomVerse">
        {/* The drawer renders in a portal, outside <header>, so it does not
            inherit the bar's accent — the active indicator fell back to the
            brand blue while the page was showing Anime red. Scoping the
            variable here keeps the menu part of the same design system
            without changing the shared Drawer primitive. */}
        <div
          className={styles.drawerScope}
          style={{ '--header-accent': accentRgb } as CSSProperties}
        >
        <nav aria-label="Fandom categories" className={styles.drawerNav}>
          {categoryLinks(closeMobileNav)}
        </nav>
        <p className={styles.drawerHeading}>Discover</p>
        <nav aria-label="Explore FandomVerse" className={styles.drawerNav}>
          {EXPLORE_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={styles.navLink}
              onClick={closeMobileNav}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        </div>
      </Drawer>
    </header>
  )
}
