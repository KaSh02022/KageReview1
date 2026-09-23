import { Container } from '../ui/Layout/Container'
import { Link } from '../ui/Link/Link'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <p>© {new Date().getFullYear()} FandomVerse. A student/competition project — not a real commercial storefront.</p>
          <nav aria-label="Footer" className={styles.links}>
            <Link to="/about" tone="muted">
              About Us
            </Link>
            <Link to="/contact" tone="muted">
              Contact Us
            </Link>
            <Link to="/bookmarks" tone="muted">
              Bookmarks
            </Link>
          </nav>
          <p className={styles.note}>
            Content is illustrative/original. See project documentation for AI-usage and licensing
            policy.
          </p>
        </div>
      </Container>
    </footer>
  )
}
