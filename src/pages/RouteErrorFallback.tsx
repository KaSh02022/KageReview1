import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { ErrorState } from '../components/ui/ErrorState/ErrorState'
import { Link } from '../components/ui/Link/Link'
import buttonStyles from '../components/ui/Button/Button.module.css'

/**
 * Router-level error boundary (data-router `errorElement` on the root
 * route) — distinct from the render-time `ErrorBoundary` inside
 * `RootLayout`. Because this replaces the *entire* root route tree
 * (including `RootLayout`, so `DocumentTitle` never mounts), it sets
 * `document.title` itself — a real Phase 3 audit gap otherwise.
 */
export function RouteErrorFallback() {
  const error = useRouteError()

  useEffect(() => {
    console.error('FandomVerse route error:', error)
    document.title = 'FandomVerse — Something Went Wrong'
  }, [error])

  return (
    <ErrorState
      title="Something went wrong"
      description="This route hit an unexpected error."
      action={
        <Link
          to="/"
          className={`${buttonStyles.button} ${buttonStyles['variant-primary']} ${buttonStyles['size-medium']}`}
        >
          Return home
        </Link>
      }
    />
  )
}
