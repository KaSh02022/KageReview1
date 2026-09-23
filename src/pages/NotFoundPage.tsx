import { Link } from '../components/ui/Link/Link'
import { ErrorState } from '../components/ui/ErrorState/ErrorState'
import buttonStyles from '../components/ui/Button/Button.module.css'

export function NotFoundPage() {
  return (
    <ErrorState
      title="Page not found"
      description="The page you're looking for doesn't exist."
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
