import { Component, type ReactNode } from 'react'

interface Props {
  onError: () => void
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render/runtime errors from the lazy-loaded WebGL canvas
 * specifically. Renders nothing on error (rather than an "Something went
 * wrong" screen) because the 2D Fandom Core fallback is already mounted
 * underneath as the base layer (docs, Phase 4 §14: "the user must never
 * be trapped inside the cinematic layer") — a canvas failure just quietly
 * leaves the already-visible fallback as the final result.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('FandomVerse cinematic canvas error:', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
