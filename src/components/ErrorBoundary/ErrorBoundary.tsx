import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '../ui/ErrorState/ErrorState'
import { Button } from '../ui/Button/Button'
import { Link } from '../ui/Link/Link'
import buttonStyles from '../ui/Button/Button.module.css'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level render-error catch, per docs/02_PRODUCT_ARCHITECTURE.md §6 —
 * a broken component tree must never show a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FandomVerse render error:', error, info.componentStack)
  }

  private handleReset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title="Something went wrong"
          description="This section of FandomVerse hit an unexpected error. You can try again, or head back to the home page."
          action={
            <>
              <Button variant="primary" onClick={this.handleReset}>
                Try again
              </Button>
              <Link
                to="/"
                className={`${buttonStyles.button} ${buttonStyles['variant-outline']} ${buttonStyles['size-medium']}`}
              >
                Go home
              </Link>
            </>
          }
        />
      )
    }

    return this.props.children
  }
}
