import { useRouteError, Link } from 'react-router-dom'

/** Router-level error boundary (data-router errorElement) — distinct from the render-time ErrorBoundary in RootLayout. */
export function RouteErrorFallback() {
  const error = useRouteError()
  console.error('FandomVerse route error:', error)

  return (
    <section role="alert" style={{ padding: '2rem' }}>
      <h1>Something went wrong</h1>
      <p>This route hit an unexpected error.</p>
      <Link to="/">Return home</Link>
    </section>
  )
}
