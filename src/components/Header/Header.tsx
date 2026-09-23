import { NavLink } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../../routes/routes'
import { useCartStore } from '../../stores/cartStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { useUiStore } from '../../stores/uiStore'
import { GlobalSearchBar } from '../GlobalSearchBar/GlobalSearchBar'
import { Clock } from '../Clock/Clock'
import { VisitorCounter } from '../VisitorCounter/VisitorCounter'
import { Container } from '../ui/Layout/Container'
import { IconButton } from '../ui/Button/IconButton'
import { Button } from '../ui/Button/Button'
import { Badge } from '../ui/Badge/Badge'
import { Drawer } from '../ui/Drawer/Drawer'
import styles from './Header.module.css'

const MORE_LINKS = [
  { to: '/trailers', label: 'Trailers' },
  { to: '/events', label: 'Events' },
  { to: '/merchandise', label: 'Merchandise' },
]

/**
 * Persistent app shell header — reachable from every page. Search,
 * bookmarks, cart, and category navigation remain available regardless of
 * the current route, per SRS p.6.
 *
 * Nav collapse point uses the canonical breakpoint system's tablet/desktop
 * boundary (1023px/1024px — docs/04_DESIGN_SYSTEM.md §2b), not the
 * arbitrary 767px value from Phase 1 (docs/11_DECISION_LOG.md D-018): a
 * 10-link category bar plus search/utility icons genuinely doesn't fit
 * comfortably until the desktop tier, so both mobile and tablet get the
 * drawer nav.
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

  const navLinks = (onNavigate?: () => void) => (
    <>
      {CATEGORY_ROUTES.map((category) => (
        <NavLink key={category.path} to={`/${category.path}`} className={styles.categoryLink} onClick={onNavigate}>
          {category.label}
        </NavLink>
      ))}
      {MORE_LINKS.map((link) => (
        <NavLink key={link.to} to={link.to} className={styles.categoryLink} onClick={onNavigate}>
          {link.label}
        </NavLink>
      ))}
    </>
  )

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.topRow}>
          <NavLink to="/" className={styles.logo}>
            FandomVerse
          </NavLink>

          <IconButton
            label="Toggle navigation menu"
            icon="☰"
            variant="outline"
            className={styles.mobileNavToggle}
            aria-expanded={isMobileNavOpen}
            onClick={openMobileNav}
          />

          <div className={styles.searchSlot}>
            <GlobalSearchBar />
          </div>

          <div className={styles.utilityBar}>
            <div className={styles.metaGroup}>
              <VisitorCounter />
              <Clock />
            </div>
            <NavLink to="/bookmarks" className={styles.iconLink} aria-label="Bookmarks">
              <span aria-hidden="true">🔖</span>
              {bookmarksCount > 0 && (
                <Badge tone="primary" shape="pill" className={styles.badge}>
                  {bookmarksCount}
                </Badge>
              )}
            </NavLink>
            <NavLink to="/cart" className={styles.iconLink} aria-label="Cart">
              <span aria-hidden="true">🛒</span>
              {cartCount > 0 && (
                <Badge tone="primary" shape="pill" className={styles.badge}>
                  {cartCount}
                </Badge>
              )}
            </NavLink>
            {isDummyLoggedIn ? (
              <Button variant="outline" size="small" onClick={() => setDummyLoggedIn(false)}>
                Log out (demo)
              </Button>
            ) : (
              <Button variant="outline" size="small" onClick={openDummyAuth}>
                Log in / Sign up
              </Button>
            )}
          </div>
        </div>
      </Container>

      <Container>
        <nav id="primary-navigation" aria-label="Fandom categories" className={styles.categoryNav}>
          {navLinks()}
        </nav>
      </Container>

      <Drawer isOpen={isMobileNavOpen} onClose={closeMobileNav} title="Browse FandomVerse">
        <nav aria-label="Fandom categories" className={styles.drawerNav}>
          {navLinks(closeMobileNav)}
        </nav>
      </Drawer>
    </header>
  )
}
