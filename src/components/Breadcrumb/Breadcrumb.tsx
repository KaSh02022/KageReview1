import { useMatches } from 'react-router-dom'
import { Container } from '../ui/Layout/Container'
import { Link } from '../ui/Link/Link'
import styles from './Breadcrumb.module.css'

interface RouteHandle {
  breadcrumb?: string
}

/**
 * Breadcrumb trail derived from route match data (react-router's
 * useMatches), per docs/02_PRODUCT_ARCHITECTURE.md §3 — not hand-maintained
 * per page. FR-044. Regression-tested against the Phase 1 bug where the
 * root route had no `handle`, so no page ever produced more than 1 crumb
 * (D-013) — see src/components/Breadcrumb/Breadcrumb.test.tsx.
 */
export function Breadcrumb() {
  const matches = useMatches()
  const crumbs = matches
    .filter((match) => Boolean((match.handle as RouteHandle | undefined)?.breadcrumb))
    .map((match) => ({
      pathname: match.pathname,
      label: (match.handle as RouteHandle).breadcrumb as string,
    }))

  if (crumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={styles.wrapper}>
      <Container>
        <ol className={styles.list}>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={crumb.pathname} className={styles.item}>
                {isLast ? (
                  <span aria-current="page" className={styles.current}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.pathname} tone="muted" underline className={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                )}
                {!isLast && (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </Container>
    </nav>
  )
}
