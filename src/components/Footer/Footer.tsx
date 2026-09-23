import { NavLink } from 'react-router-dom'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© {new Date().getFullYear()} FandomVerse. A student/competition project — not a real commercial storefront.</p>
        <nav aria-label="Footer" className={styles.links}>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          <NavLink to="/bookmarks">Bookmarks</NavLink>
        </nav>
        <p className={styles.note}>
          Content is illustrative/original. See project documentation for AI-usage and licensing
          policy.
        </p>
      </div>
    </footer>
  )
}
