import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

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
        <div className={styles.wrapper} role="alert">
          <h1>Something went wrong</h1>
          <p>
            This section of FandomVerse hit an unexpected error. You can try again, or head back
            to the home page.
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={this.handleReset}>
              Try again
            </button>
            <a href="#/">Go home</a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
