import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section role="alert">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Return home</Link>
    </section>
  )
}
