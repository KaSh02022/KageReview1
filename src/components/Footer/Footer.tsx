import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'
import { useRouteAccent } from '../../hooks/useRouteAccent'
import { Container } from '../ui/Layout/Container'
import { Clock } from '../Clock/Clock'
import { VisitorCounter } from '../VisitorCounter/VisitorCounter'
import styles from './Footer.module.css'

const DISCOVER_LINKS = [
  { to: '/trailers', label: 'Trailers' },
  { to: '/events', label: 'Events' },
  { to: '/merchandise', label: 'Merchandise' },
  { to: '/quiz', label: 'Fandom Quiz' },
]

/** About/Contact/Bookmarks, unchanged — the same destinations as before. */
const ABOUT_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/bookmarks', label: 'Bookmarks' },
]

/**
 * The global footer, in the same visual language as the header: the shared
 * `--chrome-*` micro-type, thin dividers, dark cinematic ground.
 *
 * It is editorial rather than SaaS — columns of words, no icon grid, no
 * newsletter block. The landing's colophon closes the scroll the same way.
 *
 * The clock and the visitor counter moved here from the header (FR-041 /
 * FR-042). They are ambient meta rather than navigation, and in the header
 * they were the main thing making the bar read as a dashboard. Nothing was
 * removed — both still render on every page that has the shell.
 */
export function Footer() {
  const { accentRgb } = useRouteAccent()

  return (
    <footer className={styles.footer} style={{ '--header-accent': accentRgb } as CSSProperties}>
      <Container>
        <div className={styles.columns}>
          <div className={styles.brandColumn}>
            <p className={styles.brand}>
              <b>FandomVerse</b>
              <i>Portal for Fandom World</i>
            </p>
            <div className={styles.meta}>
              <VisitorCounter />
              <Clock />
            </div>
            <p className={styles.credit}>
              Developed by TECH4 · FPT Aptech
              <br />
              <a href="mailto:TECH4_FPT_APTECH@gmail.com">TECH4_FPT_APTECH@gmail.com</a>
            </p>
          </div>

          <nav aria-label="Explore" className={styles.column}>
            <p className={styles.columnHeading}>Explore</p>
            {CATEGORY_ROUTES.map((route) => (
              <NavLink key={route.path} to={`/${route.path}`} className={styles.link}>
                {route.label}
              </NavLink>
            ))}
          </nav>

          <nav aria-label="Discover" className={styles.column}>
            <p className={styles.columnHeading}>Discover</p>
            {DISCOVER_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={styles.link}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <nav aria-label="Footer" className={styles.column}>
            <p className={styles.columnHeading}>FandomVerse</p>
            {ABOUT_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={styles.link}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.legal}>
          <p>© {new Date().getFullYear()} FandomVerse_FPT_Aptech</p>
        </div>
      </Container>
    </footer>
  )
}
