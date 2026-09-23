import { NavLink } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../../routes/routes'
import { useCartStore } from '../../stores/cartStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { useUiStore } from '../../stores/uiStore'
import { GlobalSearchBar } from '../GlobalSearchBar/GlobalSearchBar'
import { Clock } from '../Clock/Clock'
import { VisitorCounter } from '../VisitorCounter/VisitorCounter'
import styles from './Header.module.css'

/**
 * Persistent app shell header — reachable from every page. Search,
 * bookmarks, cart, and category navigation remain available regardless of
 * the current route, per SRS p.6.
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

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <NavLink to="/" className={styles.logo}>
          FandomVerse
        </NavLink>

        <button
          type="button"
          className={styles.mobileNavToggle}
          aria-expanded={isMobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => (isMobileNavOpen ? closeMobileNav() : openMobileNav())}
        >
          <span className="visually-hidden">Toggle navigation menu</span>
          <span aria-hidden="true">☰</span>
        </button>

        <div className={styles.searchSlot}>
          <GlobalSearchBar />
        </div>

        <div className={styles.utilityBar}>
          <VisitorCounter />
          <Clock />
          <NavLink to="/bookmarks" className={styles.iconLink}>
            <span aria-hidden="true">🔖</span>
            <span className="visually-hidden">Bookmarks</span>
            {bookmarksCount > 0 && <span className={styles.badge}>{bookmarksCount}</span>}
          </NavLink>
          <NavLink to="/cart" className={styles.iconLink}>
            <span aria-hidden="true">🛒</span>
            <span className="visually-hidden">Cart</span>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </NavLink>
          {isDummyLoggedIn ? (
            <button type="button" className={styles.authButton} onClick={() => setDummyLoggedIn(false)}>
              Log out (demo)
            </button>
          ) : (
            <button type="button" className={styles.authButton} onClick={openDummyAuth}>
              Log in / Sign up
            </button>
          )}
        </div>
      </div>

      <nav
        id="primary-navigation"
        aria-label="Fandom categories"
        className={`${styles.categoryNav} ${isMobileNavOpen ? styles.categoryNavOpen : ''}`}
      >
        {CATEGORY_ROUTES.map((category) => (
          <NavLink
            key={category.path}
            to={`/${category.path}`}
            className={styles.categoryLink}
            onClick={closeMobileNav}
          >
            {category.label}
          </NavLink>
        ))}
        <NavLink to="/trailers" className={styles.categoryLink} onClick={closeMobileNav}>
          Trailers
        </NavLink>
        <NavLink to="/events" className={styles.categoryLink} onClick={closeMobileNav}>
          Events
        </NavLink>
        <NavLink to="/merchandise" className={styles.categoryLink} onClick={closeMobileNav}>
          Merchandise
        </NavLink>
      </nav>
    </header>
  )
}
